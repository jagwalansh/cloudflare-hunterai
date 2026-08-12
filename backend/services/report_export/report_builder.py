import datetime
import urllib.parse
from sqlalchemy.orm import Session
from config.models import User, Profile, Match, Job
from engine.matching_engine import rank_jobs

def build_report_data(user: User, db: Session) -> dict:
    # 1. Clean up candidate name
    raw_name = user.username or (user.email.split("@")[0] if user.email else "Candidate")
    candidate_name = urllib.parse.unquote(raw_name).replace("_", " ").strip()
    if candidate_name.lower().startswith("mock_token"):
        parts = candidate_name.split(":")
        candidate_name = parts[-1] if len(parts) > 1 else "Guest User"
    if not candidate_name or candidate_name == "guest_123":
        candidate_name = "Guest User"

    # 2. Get profile
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = db.query(Profile).order_by(Profile.id.desc()).first()

    user_profile_dict = {
        "name": candidate_name,
        "email": user.email or "",
        "skills": profile.skills if profile else [],
        "education": profile.education if profile else [],
        "experience": profile.experience if profile else [],
        "projects": profile.projects if profile else []
    }

    # 3. Retrieve or calculate matches
    # Check if saved matches exist in DB
    db_matches = db.query(Match).filter(Match.user_id == user.id).order_by(Match.score.desc()).all()
    
    ranked_jobs = []
    if db_matches and len(db_matches) > 0:
        for m in db_matches:
            j = m.job
            if j:
                ranked_jobs.append({
                    "job_title": j.title or "Unknown Role",
                    "company": j.company or "Unknown Company",
                    "score": int(m.score) if m.score else 0,
                    "location": j.location or "Remote",
                    "stipend": j.stipend or "Disclosed upon application",
                    "url": j.url or "#",
                    "matched_skills": m.matched_skills or [],
                    "missing_skills": m.missing_skills or []
                })
    
    # If no DB matches, run live matching engine over DB jobs
    if not ranked_jobs:
        jobs = db.query(Job).order_by(Job.id.desc()).limit(200).all()
        engine_jobs = []
        for dj in jobs:
            engine_jobs.append({
                "id": dj.id,
                "job_title": dj.title,
                "company": dj.company,
                "stipend": dj.stipend,
                "location": dj.location,
                "duration": dj.duration,
                "required_skills": dj.skills or [],
                "url": dj.url,
                "source": dj.source,
                "constraints": dj.constraints or {}
            })
            
        if engine_jobs:
            matches_raw = rank_jobs(user_profile_dict, engine_jobs)
            for m in matches_raw:
                if m.get("score", 0) > 0:
                    ranked_jobs.append({
                        "job_title": m.get("job_title", "Unknown Role"),
                        "company": m.get("company", "Unknown Company"),
                        "score": int(m.get("score", 0)),
                        "location": m.get("location", "Remote"),
                        "stipend": m.get("stipend", "Disclosed upon application"),
                        "url": m.get("url", "#"),
                        "matched_skills": m.get("matched_skills", []),
                        "missing_skills": m.get("missing_skills", [])
                    })

    # Sort matches by score descending
    ranked_jobs.sort(key=lambda x: x["score"], reverse=True)

    total_matches = len(ranked_jobs)
    avg_score = int(sum(m["score"] for m in ranked_jobs) / total_matches) if total_matches > 0 else 0
    top_score = ranked_jobs[0]["score"] if total_matches > 0 else 0

    top_5_matches = ranked_jobs[:5]

    # Aggregate matched skills and skill gaps across all matches
    all_matched_skills = {}
    all_skill_gaps = {}
    for m in ranked_jobs:
        for s in m.get("matched_skills", []):
            all_matched_skills[s] = all_matched_skills.get(s, 0) + 1
        for s in m.get("missing_skills", []):
            all_skill_gaps[s] = all_skill_gaps.get(s, 0) + 1

    sorted_matched = sorted(all_matched_skills.items(), key=lambda x: x[1], reverse=True)
    sorted_gaps = sorted(all_skill_gaps.items(), key=lambda x: x[1], reverse=True)

    matched_skills = [k for k, v in sorted_matched[:8]]
    skill_gaps = [k for k, v in sorted_gaps[:8]]

    generated_date = datetime.datetime.now().strftime("%d %B %Y")

    return {
        "candidate_name": candidate_name,
        "generated_date": generated_date,
        "task_id": "HAI-DASHBOARD-REPORT",
        "status": "Active Analysis Complete",
        "total_matches": total_matches,
        "avg_score": avg_score,
        "top_score": top_score,
        "top_5_matches": top_5_matches,
        "matched_skills": matched_skills,
        "skill_gaps": skill_gaps,
        "candidate_skills": profile.skills if profile else []
    }
