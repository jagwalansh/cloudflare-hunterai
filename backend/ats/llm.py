import os
import asyncio
from dotenv import load_dotenv

_current_dir = os.path.dirname(os.path.abspath(__file__))
_project_backend = os.path.dirname(_current_dir)
_env_path = os.path.join(_project_backend, "config", ".env")
if os.path.exists(_env_path):
    load_dotenv(_env_path)
else:
    load_dotenv()


class LLMRateLimitError(Exception):
    """Raised when all configured LLM providers are rate-limited or unavailable."""
    pass


def ask_llm(prompt: str) -> str:
    """
    Synchronously invoke configured LLM.
    Order: Gemini first (higher free quota), Groq as fallback.
    Raises LLMRateLimitError if both providers fail so callers can surface a real error.
    """
    last_error = None

    # --- Gemini (primary: higher free-tier RPM/TPM) ---
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"[LLM] Gemini call failed: {e}")
            last_error = e

    # --- Groq fallback (llama-3.1-8b-instant: lowest TPM cost) ---
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and groq_key.startswith("gsk_"):
        try:
            from langchain.chat_models import init_chat_model
            llm = init_chat_model(
                model="llama-3.1-8b-instant",
                model_provider="groq",
                temperature=0.2,
            )
            resp = llm.invoke(prompt)
            if resp and resp.content:
                return str(resp.content)
        except Exception as e:
            print(f"[LLM] Groq fallback also failed: {e}")
            last_error = e

    raise LLMRateLimitError(
        f"Gemini Rate Limit Hit. Groq fallback also failed: {last_error}. "
        "Please check your API keys or try again in a minute."
    )


async def ask_llm_async(prompt: str) -> str:
    """
    Asynchronously invoke LLM (Gemini → Groq fallback).
    Raises LLMRateLimitError if both providers fail.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, ask_llm, prompt)

