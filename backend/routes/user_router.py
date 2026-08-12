from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from config.models import User
from config.database import get_db

router = APIRouter()


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str | None = Field(default=None, min_length=1, max_length=100)
    urls: dict[str, str] | None = None
    role: str | None = None  # "candidate" or "recruiter"
    company_name: str | None = None


class SavedInternshipRequest(BaseModel):
    job_id: int = Field(gt=0)

def serialize_user_profile(user: User):
    prof = user.profile
    return {
        "user_id": user.id,
        "name": user.username or user.email.split("@")[0],
        "email": user.email,
        "role": user.role or "candidate",
        "company_name": user.company_name,
        "skills": prof.skills if prof and prof.skills else [],
        "education": prof.education if prof and prof.education else [],
        "experience": prof.experience if prof and prof.experience else [],
        "projects": prof.projects if prof and prof.projects else [],
        "saved_internships": prof.saved_internships if prof and prof.saved_internships else [],
        "urls": user.urls or {},
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return serialize_user_profile(current_user)

@router.get("/profiles")
async def get_user_profiles_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Keep compatibility with any list endpoints
    return [serialize_user_profile(current_user)]

@router.post("/profile")
async def save_user_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.username is not None:
        current_user.username = payload.username
    if payload.urls is not None:
        current_user.urls = payload.urls
    if payload.role is not None and payload.role in ("candidate", "recruiter"):
        current_user.role = payload.role
    if payload.company_name is not None:
        current_user.company_name = payload.company_name
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return serialize_user_profile(current_user)

from config.models import Profile, Job

@router.get("/profile/saved")
async def get_saved_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.saved_internships:
        return []
    
    saved_ids = [id for id in profile.saved_internships if isinstance(id, int)]
    if not saved_ids:
        return []

    jobs = db.query(Job).filter(Job.id.in_(saved_ids)).all()
    return [
        {
            "id": j.id,
            "job_title": j.title,
            "company": j.company,
            "score": 85.0,
            "location": j.location,
            "stipend": j.stipend,
            "duration": j.duration,
            "url": j.url,
            "matched_skills": j.skills,
            "missing_skills": [],
            "source": j.source
        }
        for j in jobs
    ]

@router.post("/profile/saved")
async def save_internship(
    payload: SavedInternshipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = payload.job_id
    if not db.query(Job.id).filter(Job.id == job_id).first():
        raise HTTPException(status_code=404, detail="Job not found")
    prof = current_user.profile
    if not prof:
        prof = Profile(user_id=current_user.id, saved_internships=[])
        db.add(prof)
    
    saved = list(prof.saved_internships or [])
    if job_id not in saved:
        saved.append(job_id)
        prof.saved_internships = saved
        db.commit()
    return {"message": "Internship saved successfully"}

@router.delete("/profile/saved/{job_id}")
async def unsave_internship(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prof = current_user.profile
    if prof and prof.saved_internships:
        saved = list(prof.saved_internships)
        if job_id in saved:
            saved.remove(job_id)
            prof.saved_internships = saved
            db.commit()
    return {"message": "Internship unsaved successfully"}
