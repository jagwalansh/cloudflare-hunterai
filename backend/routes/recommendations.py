"""
recommendations.py

FastAPI routes for the natural-language preference recommendation feature.

Wire into your existing app in backend/main.py:

    from api.recommendations import router as recommendations_router
    app.include_router(recommendations_router)
"""

import asyncio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from config.database import get_db
from config.models import Job as DatabaseJob, Profile
from engine.matching_engine import (
    Job,
    JobMatch,
    apply_hard_filters,
    apply_soft_ranking,
    rank_jobs,
)
from engine.preference_extractor import PreferenceFilters, extract_preferences
from config.models import User
from routes.auth import get_current_user

# Swap this out for your real Supabase auth dependency, e.g.:
# from auth import get_current_user
# and add `user=Depends(get_current_user)` to the route below instead of
# trusting a client-supplied user_id.

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])



class PreferenceRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2_000)


class PreferenceResponse(BaseModel):
    preferences: PreferenceFilters
    jobs: list[JobMatch]


@router.post("/preferences", response_model=PreferenceResponse)
async def parse_preferences_and_rank(
    payload: PreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PreferenceResponse:
    """
    1. Extract structured preferences from the user's free-text input.
    2. Re-rank/filter that user's job matches using those preferences.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Preference text must not be empty.")

    # Provider calls are synchronous; move them off FastAPI's event loop and
    # reuse cached output for repeated preference text.
    preferences = await asyncio.to_thread(extract_preferences, payload.text.strip())

    try:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=400, detail="No profile found. Please upload a resume first.")
        db_jobs = db.query(DatabaseJob).order_by(DatabaseJob.id.desc()).limit(200).all()
        user_profile = {
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects,
        }
        raw_jobs = [{
            "id": job.id,
            "job_title": job.title,
            "company": job.company,
            "location": job.location or "",
            "stipend": job.stipend or "",
            "required_skills": job.skills or [],
            "constraints": job.constraints or {},
            "url": job.url or "",
            "source": job.source or "",
        } for job in db_jobs]
        base_scores = {str(item["id"]): item["score"] for item in rank_jobs(user_profile, raw_jobs)}
        jobs = [Job(
            id=str(job.id), title=job.title, company=job.company,
            location=job.location or "", is_remote=job.is_remote,
            stipend_monthly=job.stipend_min,
            description=" ".join([job.title, *(job.skills or [])]),
            required_skills=job.skills or [],
        ) for job in db_jobs]
        ranked_jobs = apply_soft_ranking(apply_hard_filters(jobs, preferences), preferences, base_scores)
        ranked_jobs.sort(key=lambda match: match.match_score, reverse=True)
    except Exception as exc:  # noqa: BLE001
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Matching engine failed: {exc}") from exc

    return PreferenceResponse(preferences=preferences, jobs=ranked_jobs)
