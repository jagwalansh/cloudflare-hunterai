"""Fast, deterministic extraction of job constraints from scraped listing text."""

import re
from typing import Any


def _parse_amount(value: str) -> int | None:
    match = re.search(r"(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|lakh)?", value, re.IGNORECASE)
    if not match:
        return None
    amount = float(match.group(1).replace(",", ""))
    suffix = (match.group(2) or "").lower()
    if suffix == "k":
        amount *= 1_000
    elif suffix == "lakh":
        amount *= 100_000
    return int(amount)


def extract_job_constraints(
    job_title: str,
    company: str,
    location_str: str,
    stipend_str: str,
    description: str,
) -> dict[str, Any]:
    """Extract fields needed for filtering without an LLM request per job."""
    del job_title, company
    text = f"{location_str}\n{stipend_str}\n{description}".lower()
    duration_match = re.search(r"(\d{1,2})\s*(?:month|months|mo\b)", text)
    location = location_str.strip()

    return {
        "min_education": "phd" if "phd" in text or "doctorate" in text else (
            "masters" if "master" in text else "bachelors" if "bachelor" in text else "none"
        ),
        "requires_phd": bool(re.search(r"(?:requires?|must have)\s+(?:a\s+)?(?:phd|doctorate)", text)),
        "work_mode": "remote" if "remote" in text or "work from home" in text else (
            "hybrid" if "hybrid" in text else "onsite"
        ),
        "location_city": location or None,
        "stipend_min_val": _parse_amount(stipend_str),
        "duration_months": int(duration_match.group(1)) if duration_match else None,
        "dealbreakers": [],
        # Retain source text once during ingestion so tailoring has actual job
        # context instead of reconstructing a generic description from skills.
        "description_excerpt": description[:6_000],
    }
