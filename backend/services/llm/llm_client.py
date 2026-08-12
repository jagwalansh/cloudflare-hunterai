"""
services/llm/llm_client.py

HunterAI Unified LLM Client
-----------------------------
Single file, fully implemented.

- Groq (AsyncGroq) as primary, Gemini as fallback
- Exponential backoff retry
- Per-call timeout
- In-memory prompt/response cache
- Batch execution with concurrency cap
- Pydantic schema validation for JSON extraction
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type

from dotenv import load_dotenv
from groq import AsyncGroq
from google import genai
from google.genai import types as genai_types
from pydantic import BaseModel, ValidationError

load_dotenv()

# ==========================================================
# Logging
# ==========================================================

logger = logging.getLogger("hunter.llm")

if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

# ==========================================================
# Environment / Defaults
# ==========================================================

GROQ_API_KEY      = os.getenv("GROQ_API_KEY")
GOOGLE_API_KEY    = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

DEFAULT_GROQ_MODEL   = os.getenv("DEFAULT_GROQ_MODEL",   "llama-3.1-8b-instant")
DEFAULT_GEMINI_MODEL = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.5-flash")

DEFAULT_TIMEOUT     = int(os.getenv("LLM_TIMEOUT",     "20"))
DEFAULT_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0"))
DEFAULT_MAX_TOKENS  = int(os.getenv("LLM_MAX_TOKENS",  "2048"))
MAX_RETRIES         = int(os.getenv("LLM_MAX_RETRIES", "3"))
CACHE_LIMIT         = 1000
BATCH_CONCURRENCY   = 10   # max parallel calls in batch()

# ==========================================================
# Exceptions
# ==========================================================

class LLMException(Exception):          pass
class GroqException(LLMException):      pass
class GeminiException(LLMException):    pass
class JSONValidationException(LLMException): pass
class TimeoutException(LLMException):   pass
class AllProvidersFailedException(LLMException): pass

# ==========================================================
# In-Memory Cache  (LRU-style, bounded)
# ==========================================================

class MemoryCache:
    def __init__(self):
        self._data:       Dict[str, Any]   = {}
        self._timestamps: Dict[str, float] = {}

    def _evict(self):
        """Evict the 100 oldest entries when the cache is full."""
        if len(self._data) < CACHE_LIMIT:
            return
        oldest = sorted(self._timestamps.items(), key=lambda x: x[1])[:100]
        for key, _ in oldest:
            self._data.pop(key, None)
            self._timestamps.pop(key, None)

    def get(self, key: str) -> Optional[Any]:
        return self._data.get(key)

    def set(self, key: str, value: Any) -> None:
        self._evict()
        self._data[key]       = value
        self._timestamps[key] = time.monotonic()

    @staticmethod
    def make_key(*parts: str) -> str:
        raw = "|".join(parts)
        return hashlib.sha256(raw.encode()).hexdigest()


_cache = MemoryCache()

# ==========================================================
# Retry helper
# ==========================================================

async def _retry(coro_fn, retries: int = MAX_RETRIES, base_delay: float = 1.0):
    """
    Call coro_fn() up to `retries` times with exponential backoff.
    Re-raises the last exception if all attempts fail.
    """
    last_exc: Exception = RuntimeError("No attempts made")
    for attempt in range(1, retries + 1):
        try:
            return await coro_fn()
        except (TimeoutError, asyncio.TimeoutError) as e:
            last_exc = TimeoutException(str(e))
            logger.warning("LLM timeout on attempt %d/%d", attempt, retries)
        except Exception as e:
            last_exc = e
            logger.warning("LLM error on attempt %d/%d: %s", attempt, retries, e)
        if attempt < retries:
            await asyncio.sleep(base_delay * (2 ** (attempt - 1)))
    raise last_exc

# ==========================================================
# Base interface
# ==========================================================

class BaseLLMClient(ABC):

    @abstractmethod
    async def invoke(
        self,
        prompt: str,
        *,
        system: str = "",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        timeout: Optional[int] = None,
    ) -> str: ...

    @abstractmethod
    async def extract_json(
        self,
        prompt: str,
        schema: Type[BaseModel],
        *,
        system: str = "",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        use_cache: bool = True,
    ) -> dict: ...

    @abstractmethod
    async def chat(
        self,
        messages: List[Dict[str, str]],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> str: ...

    @abstractmethod
    async def batch(
        self,
        prompts: List[str],
        *,
        concurrency: int = BATCH_CONCURRENCY,
        **kwargs,
    ) -> List[str]: ...

# ==========================================================
# LLM Client  (Groq primary → Gemini fallback)
# ==========================================================

class LLMClient(BaseLLMClient):

    def __init__(self):
        self._groq: Optional[AsyncGroq]    = None
        self._gemini: Optional[genai.Client] = None

        if GROQ_API_KEY:
            self._groq = AsyncGroq(api_key=GROQ_API_KEY)
            logger.info("Groq client initialized (model: %s)", DEFAULT_GROQ_MODEL)
        else:
            logger.warning("GROQ_API_KEY not set — Groq unavailable")

        if GOOGLE_API_KEY:
            self._gemini = genai.Client(api_key=GOOGLE_API_KEY)
            logger.info("Gemini client initialized (model: %s)", DEFAULT_GEMINI_MODEL)
        else:
            logger.warning("GEMINI_API_KEY / GOOGLE_API_KEY not set — Gemini unavailable")

    # ----------------------------------------------------------
    # Internal: Groq free-text call
    # ----------------------------------------------------------
    async def _groq_invoke(
        self,
        prompt: str,
        system: str,
        model: str,
        temperature: float,
        max_tokens: int,
        timeout: int,
    ) -> str:
        if not self._groq:
            raise GroqException("Groq client not initialised")

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async def _call():
            resp = await asyncio.wait_for(
                self._groq.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                ),
                timeout=timeout,
            )
            return resp.choices[0].message.content or ""

        return await _retry(_call)

    # ----------------------------------------------------------
    # Internal: Groq JSON-mode call
    # ----------------------------------------------------------
    async def _groq_extract_json(
        self,
        prompt: str,
        system: str,
        model: str,
        temperature: float,
        timeout: int,
    ) -> dict:
        if not self._groq:
            raise GroqException("Groq client not initialised")

        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async def _call():
            resp = await asyncio.wait_for(
                self._groq.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=DEFAULT_MAX_TOKENS,
                    response_format={"type": "json_object"},
                ),
                timeout=timeout,
            )
            raw = resp.choices[0].message.content or "{}"
            return json.loads(raw)

        return await _retry(_call)

    # ----------------------------------------------------------
    # Internal: Gemini free-text call
    # ----------------------------------------------------------
    async def _gemini_invoke(
        self,
        prompt: str,
        system: str,
        model: str,
        temperature: float,
        timeout: int,
    ) -> str:
        if not self._gemini:
            raise GeminiException("Gemini client not initialised")

        config = genai_types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system or None,
        )

        async def _call():
            resp = await asyncio.wait_for(
                self._gemini.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                ),
                timeout=timeout,
            )
            return resp.text or ""

        return await _retry(_call)

    # ----------------------------------------------------------
    # Internal: Gemini JSON-schema call
    # ----------------------------------------------------------
    async def _gemini_extract_json(
        self,
        prompt: str,
        system: str,
        schema: Type[BaseModel],
        model: str,
        temperature: float,
        timeout: int,
    ) -> dict:
        if not self._gemini:
            raise GeminiException("Gemini client not initialised")

        config = genai_types.GenerateContentConfig(
            temperature=temperature,
            system_instruction=system or None,
            response_mime_type="application/json",
            response_schema=schema,
        )

        async def _call():
            resp = await asyncio.wait_for(
                self._gemini.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=config,
                ),
                timeout=timeout,
            )
            return json.loads(resp.text)

        return await _retry(_call)

    # ----------------------------------------------------------
    # Public: invoke  (free-text, Groq → Gemini fallback)
    # ----------------------------------------------------------
    async def invoke(
        self,
        prompt: str,
        *,
        system: str = "",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        timeout: Optional[int] = None,
    ) -> str:
        groq_model  = model       or DEFAULT_GROQ_MODEL
        temp        = temperature if temperature is not None else DEFAULT_TEMPERATURE
        tokens      = max_tokens  or DEFAULT_MAX_TOKENS
        t           = timeout     or DEFAULT_TIMEOUT

        if self._groq:
            try:
                return await self._groq_invoke(prompt, system, groq_model, temp, tokens, t)
            except Exception as e:
                logger.warning("Groq invoke failed, falling back to Gemini: %s", e)

        if self._gemini:
            try:
                return await self._gemini_invoke(
                    prompt, system, model or DEFAULT_GEMINI_MODEL, temp, t
                )
            except Exception as e:
                logger.error("Gemini invoke also failed: %s", e)
                raise AllProvidersFailedException(str(e))

        raise AllProvidersFailedException("No LLM provider available")

    # ----------------------------------------------------------
    # Public: extract_json  (JSON output + Pydantic validation)
    # ----------------------------------------------------------
    async def extract_json(
        self,
        prompt: str,
        schema: Type[BaseModel],
        *,
        system: str = "",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        use_cache: bool = True,
    ) -> dict:
        temp  = temperature if temperature is not None else DEFAULT_TEMPERATURE
        t     = DEFAULT_TIMEOUT

        # Cache lookup
        if use_cache:
            cache_key = MemoryCache.make_key(prompt, schema.__name__, str(temp))
            cached = _cache.get(cache_key)
            if cached is not None:
                logger.debug("Cache hit for schema %s", schema.__name__)
                return cached

        raw: Optional[dict] = None

        # Try Groq
        if self._groq:
            try:
                raw = await self._groq_extract_json(
                    prompt, system, model or DEFAULT_GROQ_MODEL, temp, t
                )
            except Exception as e:
                logger.warning("Groq extract_json failed, falling back to Gemini: %s", e)

        # Try Gemini
        if raw is None and self._gemini:
            try:
                raw = await self._gemini_extract_json(
                    prompt, system, schema, model or DEFAULT_GEMINI_MODEL, temp, t
                )
            except Exception as e:
                logger.error("Gemini extract_json also failed: %s", e)
                raise AllProvidersFailedException(str(e))

        if raw is None:
            raise AllProvidersFailedException("No LLM provider available")

        # Validate against Pydantic schema
        try:
            result = schema(**raw).model_dump()
        except ValidationError as e:
            raise JSONValidationException(
                f"LLM response didn't match schema {schema.__name__}: {e}"
            )

        if use_cache:
            _cache.set(cache_key, result)

        return result

    # ----------------------------------------------------------
    # Public: chat  (messages list, Groq → Gemini fallback)
    # ----------------------------------------------------------
    async def chat(
        self,
        messages: List[Dict[str, str]],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        json_mode: bool = False,
    ) -> str:
        temp = temperature if temperature is not None else DEFAULT_TEMPERATURE
        t    = DEFAULT_TIMEOUT

        if self._groq:
            try:
                async def _call():
                    kwargs: Dict[str, Any] = dict(
                        model=model or DEFAULT_GROQ_MODEL,
                        messages=messages,
                        temperature=temp,
                        max_tokens=DEFAULT_MAX_TOKENS,
                    )
                    if json_mode:
                        kwargs["response_format"] = {"type": "json_object"}
                    resp = await asyncio.wait_for(
                        self._groq.chat.completions.create(**kwargs),
                        timeout=t,
                    )
                    return resp.choices[0].message.content or ""

                return await _retry(_call)
            except Exception as e:
                logger.warning("Groq chat failed, falling back to Gemini: %s", e)

        if self._gemini:
            try:
                # Flatten message list to a single string for Gemini
                combined = "\n".join(
                    f"{m['role'].upper()}: {m['content']}" for m in messages
                )
                return await self._gemini_invoke(
                    combined, "", model or DEFAULT_GEMINI_MODEL, temp, t
                )
            except Exception as e:
                logger.error("Gemini chat also failed: %s", e)
                raise AllProvidersFailedException(str(e))

        raise AllProvidersFailedException("No LLM provider available")

    # ----------------------------------------------------------
    # Public: batch  (parallel invoke with concurrency cap)
    # ----------------------------------------------------------
    async def batch(
        self,
        prompts: List[str],
        *,
        concurrency: int = BATCH_CONCURRENCY,
        **kwargs,
    ) -> List[str]:
        semaphore = asyncio.Semaphore(concurrency)

        async def _bounded(prompt: str) -> str:
            async with semaphore:
                return await self.invoke(prompt, **kwargs)

        results = await asyncio.gather(
            *[_bounded(p) for p in prompts],
            return_exceptions=True,
        )

        # Replace exceptions with empty strings and log them
        output: List[str] = []
        for i, r in enumerate(results):
            if isinstance(r, Exception):
                logger.error("Batch item %d failed: %s", i, r)
                output.append("")
            else:
                output.append(r)

        return output


# ==========================================================
# Singleton — import this everywhere
# ==========================================================

llm = LLMClient()
