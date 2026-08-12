"""
preference_extractor.py

Uses an LLM (Groq / Llama 3 by default, Gemini as a fallback) to convert a
free-text description of a candidate's job/internship preferences into a
structured, validated object the matching engine can consume.

Usage:
    from engine.preference_extractor import extract_preferences
    prefs = extract_preferences("Remote or SF, min $2000/mo, software eng roles")
"""

import json
import logging
import os
import re
from functools import lru_cache
from typing import List, Optional

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------


class PreferenceFilters(BaseModel):
    """Structured representation of a user's natural-language preferences."""

    preferred_locations: List[str] = Field(
        default_factory=list,
        description="Cities, states, or 'remote'. Empty list = no location preference.",
    )
    min_stipend_monthly: Optional[int] = Field(
        default=None,
        description="Minimum acceptable monthly stipend/salary in USD, if mentioned.",
    )
    role_keywords: List[str] = Field(
        default_factory=list,
        description="Role/domain keywords, e.g. 'software engineering', 'frontend'.",
    )
    must_have: List[str] = Field(
        default_factory=list,
        description="Hard requirements outside location/stipend/role, e.g. 'visa sponsorship'.",
    )

    class Config:
        extra = "ignore"  # tolerate stray keys the model might add


EXTRACTION_SYSTEM_PROMPT = """You are a strict information-extraction engine.
You will be given a short piece of text where a job/internship seeker describes
their preferences in natural language.

Extract the information into this exact JSON shape and return ONLY the JSON,
with no markdown fences, no commentary, no explanation:

{
  "preferred_locations": string[],
  "min_stipend_monthly": number | null,
  "role_keywords": string[],
  "must_have": string[]
}

Rules:
- "preferred_locations": include city/state names as written (normalize casing),
  and include the literal string "remote" if the user says remote/WFH/anywhere.
  If nothing is mentioned, return [].
- "min_stipend_monthly": a single integer in USD per month. Convert if the user
  gives an hourly/annual figure (assume 160 hrs/month, /12 for annual). If no
  number is mentioned, return null. Never invent a number.
- "role_keywords": short role/domain phrases (e.g. "software engineering",
  "backend", "marketing"), lowercased. If nothing is mentioned, return [].
- "must_have": any other hard, non-negotiable requirement stated by the user
  (e.g. "visa sponsorship", "no weekend work", "part-time only"). Do not
  duplicate location/stipend/role info here. If none, return [].
- If the text is empty, unrelated, or you are unsure about a field, use the
  empty/null default for that field rather than guessing.
"""


def _strip_code_fences(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) >= 2 else text
        if text.lstrip().lower().startswith("json"):
            text = text.lstrip()[4:]
    return text.strip()


def _call_groq(user_text: str) -> str:
    from groq import Groq  # imported lazily so the module still loads if unused

    client = Groq(api_key=os.environ["GROQ_API_KEY"])
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0,
        max_tokens=500,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
        ],
    )
    return completion.choices[0].message.content


def _call_gemini(user_text: str) -> str:
    import google.generativeai as genai  # imported lazily

    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        system_instruction=EXTRACTION_SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json", "temperature": 0},
    )
    response = model.generate_content(user_text)
    return response.text


def _extract_preferences_locally(user_text: str) -> PreferenceFilters:
    """Low-cost parser for the common filters accepted by the UI."""
    text = user_text.lower()
    locations = ["remote"] if any(term in text for term in ("remote", "wfh", "work from home", "anywhere")) else []
    amount_match = re.search(r"(?:₹|rs\.?|inr|\$)\s*([\d,.]+)\s*(k)?", text)
    stipend = None
    if amount_match:
        stipend = int(float(amount_match.group(1).replace(",", "")) * (1_000 if amount_match.group(2) else 1))
    roles = [
        phrase for phrase in ("machine learning", "data science", "data analyst", "backend", "frontend", "full stack", "software engineering", "marketing", "design")
        if phrase in text
    ]
    return PreferenceFilters(
        preferred_locations=locations,
        min_stipend_monthly=stipend,
        role_keywords=roles,
    )


@lru_cache(maxsize=256)
def extract_preferences(user_text: str) -> PreferenceFilters:
    """
    Convert free-text preferences into a validated PreferenceFilters object.

    Tries Groq first (fast + cheap), falls back to Gemini if Groq errors,
    and finally falls back to an all-empty PreferenceFilters so a single
    flaky LLM call never breaks the recommendations endpoint.
    """
    user_text = (user_text or "").strip()
    if not user_text:
        return PreferenceFilters()

    if os.getenv("PREFERENCE_PARSER_USE_LLM", "false").lower() != "true":
        return _extract_preferences_locally(user_text)

    raw_json: Optional[str] = None

    try:
        raw_json = _call_groq(user_text)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Groq preference extraction failed, trying Gemini: %s", exc)
        try:
            raw_json = _call_gemini(user_text)
        except Exception as exc2:  # noqa: BLE001
            logger.error("Gemini preference extraction also failed: %s", exc2)
            return PreferenceFilters()

    try:
        parsed = json.loads(_strip_code_fences(raw_json))
        return PreferenceFilters(**parsed)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.error("Could not parse/validate LLM preference output: %s\nRaw: %s", exc, raw_json)
        return PreferenceFilters()
