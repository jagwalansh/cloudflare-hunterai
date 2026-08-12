import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from routes.auth import get_current_user, require_role
from config.models import User, JobPosting, Application, Profile
from config.database import get_db

router = APIRouter(prefix="/recruiter", tags=["Recruiter"])


# ── Schemas ──────────────────────────────────────────────────────────────

class JobPostingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    skills_required: list[str] = []
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "internship"
    is_remote: bool = False


class JobPostingUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    skills_required: Optional[list[str]] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    is_remote: Optional[bool] = None
    is_active: Optional[bool] = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern=r"^(applied|reviewed|shortlisted|rejected)$")


# ── Helpers ──────────────────────────────────────────────────────────────

def _serialize_posting(posting: JobPosting) -> dict:
    return {
        "id": posting.id,
        "recruiter_id": posting.recruiter_id,
        "title": posting.title,
        "company": posting.company,
        "description": posting.description,
        "skills_required": posting.skills_required or [],
        "location": posting.location,
        "salary_range": posting.salary_range,
        "job_type": posting.job_type,
        "is_remote": posting.is_remote,
        "is_active": posting.is_active,
        "created_at": posting.created_at.isoformat() if posting.created_at else None,
        "updated_at": posting.updated_at.isoformat() if posting.updated_at else None,
        "applicant_count": len(posting.applications) if posting.applications else 0,
    }


def _serialize_application(app: Application) -> dict:
    candidate = app.candidate
    profile = candidate.profile if candidate else None
    posting = app.job_posting
    
    cand_skills = profile.skills if profile and profile.skills else []
    required_skills = posting.skills_required if posting and posting.skills_required else []
    
    # Calculate skill match score
    if required_skills:
        cand_skills_lower = set(s.lower() for s in cand_skills)
        matched = [s for s in required_skills if s.lower() in cand_skills_lower]
        match_score = round((len(matched) / len(required_skills)) * 100, 1)
    else:
        match_score = 85.0

    # Check if candidate has uploaded a PDF resume file
    resume_file_path = f"/tmp/hunterai_uploads/{app.candidate_id}/resume.pdf"
    has_resume = os.path.exists(resume_file_path)

    return {
        "id": app.id,
        "candidate_id": app.candidate_id,
        "candidate_name": candidate.username or candidate.email.split("@")[0] if candidate else "Unknown",
        "candidate_email": candidate.email if candidate else "",
        "candidate_skills": cand_skills,
        "candidate_experience": profile.experience if profile and profile.experience else [],
        "candidate_education": profile.education if profile and profile.education else [],
        "candidate_projects": profile.projects if profile and profile.projects else [],
        "match_score": match_score,
        "has_resume": has_resume,
        "job_posting_id": app.job_posting_id,
        "job_title": posting.title if posting else "",
        "company": posting.company if posting else "",
        "status": app.status,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
    }


# ── Dashboard ────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def recruiter_dashboard(
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    postings = db.query(JobPosting).filter(JobPosting.recruiter_id == current_user.id).all()
    total_postings = len(postings)
    active_postings = sum(1 for p in postings if p.is_active)
    total_applications = sum(len(p.applications) for p in postings)
    shortlisted = sum(
        sum(1 for a in p.applications if a.status == "shortlisted")
        for p in postings
    )
    
    recent_applications = []
    for p in postings:
        for a in (p.applications or []):
            recent_applications.append({
                **_serialize_application(a),
                "job_title": p.title,
                "company": p.company,
            })
    recent_applications.sort(key=lambda x: x.get("applied_at", ""), reverse=True)
    
    return {
        "total_postings": total_postings,
        "active_postings": active_postings,
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "recent_applications": recent_applications[:20],
    }


# ── Job Postings CRUD ───────────────────────────────────────────────────

@router.post("/jobs")
async def create_job_posting(
    payload: JobPostingCreate,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    posting = JobPosting(
        recruiter_id=current_user.id,
        title=payload.title,
        company=payload.company,
        description=payload.description,
        skills_required=payload.skills_required,
        location=payload.location,
        salary_range=payload.salary_range,
        job_type=payload.job_type,
        is_remote=payload.is_remote,
    )
    db.add(posting)
    db.commit()
    db.refresh(posting)
    return _serialize_posting(posting)


@router.get("/jobs")
async def list_job_postings(
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    postings = (
        db.query(JobPosting)
        .filter(JobPosting.recruiter_id == current_user.id)
        .order_by(JobPosting.created_at.desc())
        .all()
    )
    return [_serialize_posting(p) for p in postings]


@router.get("/jobs/{job_id}")
async def get_job_posting(
    job_id: int,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return _serialize_posting(posting)


@router.put("/jobs/{job_id}")
async def update_job_posting(
    job_id: int,
    payload: JobPostingUpdate,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(posting, key, value)
    
    posting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(posting)
    return _serialize_posting(posting)


@router.delete("/jobs/{job_id}")
async def delete_job_posting(
    job_id: int,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    posting.is_active = False
    db.commit()
    return {"message": "Job posting deactivated"}


# ── Candidates for a Job ─────────────────────────────────────────────────

@router.get("/jobs/{job_id}/candidates")
async def get_job_candidates(
    job_id: int,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    return [_serialize_application(a) for a in posting.applications]


@router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    application = Application(id=application_id) if False else db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status in ("shortlisted", "rejected"):
        raise HTTPException(
            status_code=400,
            detail="Application status has already been finalized and cannot be modified."
        )

    # Verify the posting belongs to this recruiter
    posting = db.query(JobPosting).filter(
        JobPosting.id == application.job_posting_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    application.status = payload.status
    db.commit()
    return {"message": f"Application status updated to '{payload.status}'"}


@router.get("/applications/{application_id}/resume")
async def download_candidate_resume(
    application_id: int,
    current_user: User = Depends(require_role("recruiter")),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify posting belongs to this recruiter
    posting = db.query(JobPosting).filter(
        JobPosting.id == application.job_posting_id,
        JobPosting.recruiter_id == current_user.id
    ).first()
    if not posting:
        raise HTTPException(status_code=403, detail="Not authorized to access this resume")

    resume_path = f"/tmp/hunterai_uploads/{application.candidate_id}/resume.pdf"
    if not os.path.exists(resume_path):
        raise HTTPException(status_code=404, detail="Candidate resume PDF file not found")

    cand_name = (application.candidate.username or "candidate").replace(" ", "_")
    return FileResponse(
        path=resume_path,
        media_type="application/pdf",
        filename=f"{cand_name}_Resume.pdf"
    )


# ── Candidate-facing: browse recruiter postings & apply ──────────────────

@router.get("/browse-jobs")
async def browse_job_postings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    remote_only: bool = False,
    job_type: Optional[str] = None,
):
    query = db.query(JobPosting).filter(JobPosting.is_active == True)
    
    if keyword:
        keyword_filter = f"%{keyword}%"
        query = query.filter(
            JobPosting.title.ilike(keyword_filter) | JobPosting.company.ilike(keyword_filter)
        )
    if location:
        query = query.filter(JobPosting.location.ilike(f"%{location}%"))
    if remote_only:
        query = query.filter(JobPosting.is_remote == True)
    if job_type:
        query = query.filter(JobPosting.job_type == job_type)
    
    postings = query.order_by(JobPosting.created_at.desc()).all()
    return [_serialize_posting(p) for p in postings]


@router.post("/apply/{job_posting_id}")
async def apply_to_job(
    job_posting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "candidate":
        raise HTTPException(status_code=403, detail="Only candidates can apply to jobs")
    
    posting = db.query(JobPosting).filter(
        JobPosting.id == job_posting_id,
        JobPosting.is_active == True
    ).first()
    if not posting:
        raise HTTPException(status_code=404, detail="Job posting not found or inactive")
    
    existing = db.query(Application).filter(
        Application.candidate_id == current_user.id,
        Application.job_posting_id == job_posting_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    application = Application(
        candidate_id=current_user.id,
        job_posting_id=job_posting_id,
    )
    db.add(application)
    db.commit()
    return {"message": "Application submitted successfully"}


@router.get("/my-applications")
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    applications = db.query(Application).filter(
        Application.candidate_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()
    return [_serialize_application(a) for a in applications]
