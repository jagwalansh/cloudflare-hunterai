import os
from fastapi import APIRouter, UploadFile, Depends, HTTPException, File, Header
from sqlalchemy.orm import Session
from parsers.user_resume_parser import parse_resume_to_json, extract_text, extract_profile_regex
from ats.llm import LLMRateLimitError
from routes.auth import get_current_user
from config.models import User, Profile
from config.database import get_db

router = APIRouter()

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
# Use /tmp for Vercel Serverless compatibility
upload_base_dir = "/tmp/hunterai_uploads"


@router.post("/file/upload/resume")
async def upload_file(
    file: UploadFile = File(...),
    authorization: str = Header(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure user-specific directory exists
    user_upload_dir = os.path.join(upload_base_dir, current_user.id)
    os.makedirs(user_upload_dir, exist_ok=True)
    
    # Validate PDF format
    if file.content_type != "application/pdf" and not (file.filename and file.filename.lower().endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF files (.pdf) are allowed.")

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5MB.")

    file_path = os.path.join(user_upload_dir, "resume.pdf")
    with open(file_path, "wb") as f:
        f.write(content)

    # Sync to Supabase Storage if configured and not in dev mock sandbox
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    parts = authorization.split() if authorization else []
    token = parts[1] if len(parts) > 1 else parts[0] if len(parts) == 1 else ""
    is_mock = token.startswith("mock_token:")

    if supabase_url and not is_mock and authorization and token:
        import httpx
        try:
            upload_url = f"{supabase_url.rstrip('/')}/storage/v1/object/resumes/{current_user.id}/resume.pdf"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/pdf",
                "x-upsert": "true"
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(upload_url, headers=headers, content=content)
                if response.status_code not in (200, 201):
                    print(f"Supabase Storage upload warning: status {response.status_code}, detail: {response.text}")
                else:
                    print(f"Successfully uploaded resume to Supabase Storage for user {current_user.id}")
        except Exception as upload_err:
            print(f"Supabase Storage upload error: {upload_err}")


    # Automatically parse the resume
    try:
        profile_data = await parse_resume_to_json(file_path)
    except LLMRateLimitError as rate_err:
        # Both AI providers are rate-limited — degrade gracefully to regex parser
        print(f"[Upload] LLM rate-limited, using regex fallback: {rate_err}")
        try:
            text = extract_text(file_path)
            profile_data = extract_profile_regex(text)
        except Exception as regex_err:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"File uploaded successfully, but parsing failed: {regex_err}"
            )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"File uploaded successfully, but parsing or saving failed: {e}"
        )

    try:
        # Sync name if user didn't have one set in auth
        if not current_user.username and profile_data.get("name"):
            current_user.username = profile_data["name"]
            db.add(current_user)
            
        # Update or create Profile in database
        db_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not db_profile:
            db_profile = Profile(
                user_id=current_user.id,
                skills=profile_data.get("skills", []),
                education=profile_data.get("education", []),
                experience=profile_data.get("experience", []),
                projects=profile_data.get("projects", [])
            )
            db.add(db_profile)
        else:
            db_profile.skills = profile_data.get("skills", [])
            db_profile.education = profile_data.get("education", [])
            db_profile.experience = profile_data.get("experience", [])
            db_profile.projects = profile_data.get("projects", [])
        
        db.commit()
        db.refresh(db_profile)

        # Standardize return object to match what frontend expects
        formatted_profile = {
            "user_id": current_user.id,
            "name": current_user.username or profile_data.get("name", ""),
            "email": current_user.email,
            "skills": db_profile.skills,
            "education": db_profile.education,
            "experience": db_profile.experience,
            "projects": db_profile.projects
        }

        return {
            "message": "File uploaded and parsed successfully",
            "file_name": file.filename,
            "saved_path": file_path,
            "profile": formatted_profile
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"File uploaded successfully, but saving profile failed: {e}"
        )