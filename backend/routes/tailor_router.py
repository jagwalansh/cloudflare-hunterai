from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import hashlib
import json

from config.database import get_db
from config.models import User, Profile, Job, TailoredResume
from routes.auth import get_current_user
from services.resume_tailor import TAILORING_VERSION, tailor_resume_json
from engine.matching_engine import evaluate_suitability
from pydantic import BaseModel

router = APIRouter()

class TailorRequest(BaseModel):
    job_id: int
    approved_plan: Optional[str] = None

class PlanRequest(BaseModel):
    job_id: int
    feedback: Optional[str] = None

@router.post("/tailor-resume/plan")
async def generate_plan_endpoint(
    req: PlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        from services.resume_tailor import generate_tailor_plan
        
        # 1. Fetch Profile and Job
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=400, detail="Profile not found.")
            
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found.")
            
        user_profile_dict = {
            "name": current_user.username,
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects
        }
        
        job_dict = {
            "job_title": job.title,
            "company": job.company,
            "required_skills": job.skills,
            "description": job.constraints.get("description_excerpt") or f"Role requires {', '.join(job.skills) if job.skills else 'various skills'}."
        }
        
        # Generate plan
        plan = await generate_tailor_plan(user_profile_dict, job_dict, req.feedback)
        
        return {"plan": plan}
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to generate a tailoring plan.")

@router.post("/tailor-resume")
async def tailor_resume_endpoint(
    req: TailorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch Profile and Job
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=400, detail="Profile not found.")
            
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found.")
            
        user_profile_dict = {
            "name": current_user.username,
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects
        }
        
        job_dict = {
            "job_title": job.title,
            "company": job.company,
            "required_skills": job.skills,
            "description": job.constraints.get("description_excerpt") or f"Role requires {', '.join(job.skills) if job.skills else 'various skills'}."
        }
        
        # Hash profile for caching
        # Cache only output produced by the current factual-tailoring policy.
        profile_hash_str = json.dumps(
            {"version": TAILORING_VERSION, "profile": user_profile_dict}, sort_keys=True
        )
        profile_hash = hashlib.sha256(profile_hash_str.encode()).hexdigest()
        
        # 2. Check Cache
        cached = db.query(TailoredResume).filter(
            TailoredResume.user_id == current_user.id,
            TailoredResume.job_id == job.id,
            TailoredResume.profile_version_hash == profile_hash
        ).first()
        
        if cached and not req.approved_plan:
            return {
                "tailored_profile": cached.tailored_json,
                "ats_score_before": cached.ats_score_before,
                "ats_score_after": cached.ats_score_after
            }
            
        # 3. Calculate original ATS score
        suitability_before = evaluate_suitability(user_profile_dict, job_dict)
        ats_score_before = suitability_before.get("score", 0.0)
        
        # 4. Tailor Resume (LLM)
        tailored_json = await tailor_resume_json(user_profile_dict, job_dict, req.approved_plan)
        
        # Re-attach name to tailored profile so it can be used for rendering
        tailored_json["name"] = current_user.username
        tailored_json["email"] = current_user.email
        tailored_json.update(current_user.urls or {})
        
        # 5. Calculate new ATS score
        suitability_after = evaluate_suitability(tailored_json, job_dict)
        ats_score_after = suitability_after.get("score", 0.0)
        
        # 6. Save to cache
        if cached:
            cached.tailored_json = tailored_json
            cached.ats_score_before = ats_score_before
            cached.ats_score_after = ats_score_after
        else:
            db.add(TailoredResume(
                user_id=current_user.id,
                job_id=job.id,
                profile_version_hash=profile_hash,
                tailored_json=tailored_json,
                ats_score_before=ats_score_before,
                ats_score_after=ats_score_after,
            ))
        db.commit()
        
        return {
            "tailored_profile": tailored_json,
            "ats_score_before": ats_score_before,
            "ats_score_after": ats_score_after
        }
        
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to tailor resume.")
