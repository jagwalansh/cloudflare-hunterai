"""Deterministic, explainable ATS scoring helpers."""

import re
from typing import Any


STOP_WORDS = {
    "and", "the", "with", "for", "from", "that", "this", "will", "have", "role",
    "job", "work", "team", "years", "year", "intern", "internship", "candidate",
}
ACTION_VERBS = {"built", "created", "developed", "designed", "implemented", "led", "improved", "deployed", "analyzed", "automated", "managed", "delivered"}
SECTION_NAMES = {"skills", "experience", "education", "projects", "summary", "certifications"}


def _terms(text: str) -> set[str]:
    return {
        term for term in re.findall(r"[a-z][a-z0-9+#/-]*(?:\.[a-z0-9+#/-]+)*", text.lower())
        if term not in STOP_WORDS
    }


def _category_score(text: str, jd_terms: set[str]) -> tuple[int, list[str]]:
    resume_terms = _terms(text)
    target_terms = {term for term in jd_terms if len(term) > 2}
    if not target_terms:
        # A generic score is deliberately conservative without a job description.
        technical_markers = {"python", "java", "sql", "react", "aws", "docker", "excel", "git"}
        return (55 if resume_terms & technical_markers else 35), []
    matched = resume_terms & target_terms
    return round(100 * len(matched) / len(target_terms)), sorted(target_terms - matched)[:12]


def _experience_score(text: str) -> int:
    lower = text.lower()
    score = 0
    if "experience" in lower or "employment" in lower:
        score += 30
    if "project" in lower:
        score += 20
    if any(verb in lower for verb in ACTION_VERBS):
        score += 25
    if re.search(r"\b\d+(?:\.\d+)?\s*(?:%|users|ms|hours|days|months|projects)\b", lower):
        score += 25
    return min(score, 100)


def _formatting_score(text: str) -> int:
    lower = text.lower()
    score = 0
    score += 20 if re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text) else 0
    score += min(50, 10 * sum(section in lower for section in SECTION_NAMES))
    score += 20 if 250 <= len(text) <= 12_000 else 5
    score += 10 if "•" in text or "- " in text else 0
    return min(score, 100)


def _grammar_score(text: str) -> int:
    words = re.findall(r"\b\w+\b", text)
    if len(words) < 40:
        return 35
    alphabetic_ratio = sum(word.isalpha() for word in words) / len(words)
    return 85 if alphabetic_ratio > 0.88 else 65


def derive_status(overall_score: int) -> str:
    if overall_score >= 90:
        return "Excellent"
    if overall_score >= 70:
        return "Good"
    if overall_score >= 50:
        return "Needs Improvement"
    return "Poor"


def score_resume(resume_text: str, job_description: str = "") -> dict[str, Any]:
    """Score a resume from transparent, stable signals; no provider fallback score."""
    resume_text = resume_text or ""
    keyword_score, missing_keywords = _category_score(resume_text, _terms(job_description))
    skills_score = keyword_score
    experience_score = _experience_score(resume_text)
    formatting_score = _formatting_score(resume_text)
    grammar_score = _grammar_score(resume_text)

    overall_score = round(
        skills_score * 0.40
        + keyword_score * 0.25
        + experience_score * 0.20
        + grammar_score * 0.05
        + formatting_score * 0.10
    )
    categories = {
        "keywords": keyword_score,
        "skills": skills_score,
        "experience": experience_score,
        "grammar": grammar_score,
        "formatting": formatting_score,
    }
    suggestions = []
    if missing_keywords:
        suggestions.append("Add only relevant missing keywords: " + ", ".join(missing_keywords[:5]) + ".")
    if experience_score < 70:
        suggestions.append("Use action verbs and quantify outcomes in project or experience bullets.")
    if formatting_score < 70:
        suggestions.append("Add clear resume sections and complete contact details.")
    return {
        "overall_score": overall_score,
        "status": derive_status(overall_score),
        "categories": categories,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions,
    }


def format_ats_result(data: dict[str, Any]) -> dict[str, Any]:
    """Compatibility normalizer for callers that already have a score payload."""
    overall_score = max(0, min(100, int(data.get("overall_score", 0))))
    categories = data.get("categories") if isinstance(data.get("categories"), dict) else {}
    return {
        "overall_score": overall_score,
        "status": derive_status(overall_score),
        "categories": {key: max(0, min(100, int(categories.get(key, 0)))) for key in ("keywords", "skills", "experience", "grammar", "formatting")},
        "missing_keywords": data.get("missing_keywords", []) if isinstance(data.get("missing_keywords"), list) else [],
        "suggestions": data.get("suggestions", []) if isinstance(data.get("suggestions"), list) else [],
    }
