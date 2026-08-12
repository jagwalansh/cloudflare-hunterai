import os
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from routes.auth import get_current_user

# Attempt to load google-genai
try:
    from google import genai
    from google.genai import types
    has_genai = True
except ImportError:
    has_genai = False

router = APIRouter(prefix="/resume-ai", tags=["Resume AI"])

# --- Request Models ---

class GenerateResumeRequest(BaseModel):
    target_role: Optional[str] = None
    raw_experience: str = Field(max_length=12_000)
    raw_projects: str = Field(max_length=12_000)
    raw_education: str = Field(max_length=6_000)
    known_skills: List[str] = Field(default_factory=list)

class ImproveSectionRequest(BaseModel):
    section_type: Literal['summary', 'experience', 'project', 'headline']
    current_text: str
    context: Optional[dict] = None

class ImproveSectionResponse(BaseModel):
    suggestions: List[str]

# --- Output Schema for Bulk Generate ---

class ExperienceItem(BaseModel):
    role: str = ""
    company: str = ""
    duration: str = ""
    description: str = ""

class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    year: str = ""

class ProjectItem(BaseModel):
    name: str = ""
    techStack: List[str] = Field(default_factory=list)
    description: str = ""

class ResumeDataSchema(BaseModel):
    firstName: str = ""
    lastName: str = ""
    headline: str = ""
    email: str = ""
    phone: str = ""
    city: str = ""
    country: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    summary: str = ""
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)


def get_genai_client():
    # Support both GEMINI_API_KEY and GOOGLE_API_KEY for backwards compatibility
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured. Set GEMINI_API_KEY in your environment variables."
        )
    if not has_genai:
        raise HTTPException(
            status_code=500,
            detail="google-genai package is missing. Run: pip install google-genai"
        )
    return genai.Client(api_key=api_key)


def builder_ai_enabled() -> bool:
    """AI drafting is opt-in so the free tier never blocks the builder."""
    return os.getenv("RESUME_BUILDER_USE_LLM", "false").lower() == "true"


def build_factual_draft_fallback(req: GenerateResumeRequest) -> dict:
    """Keep the builder usable during an AI-provider outage without inventing facts."""
    experience = [ExperienceItem(description=req.raw_experience.strip())] if req.raw_experience.strip() else []
    projects = [ProjectItem(description=req.raw_projects.strip())] if req.raw_projects.strip() else []
    education = [EducationItem(degree=req.raw_education.strip())] if req.raw_education.strip() else []
    return finalize_resume_draft(ResumeDataSchema(
        headline=req.target_role.strip() if req.target_role else "",
        experience=experience,
        projects=projects,
        education=education,
        skills=[skill.strip() for skill in req.known_skills if skill.strip()],
    ).model_dump())


def finalize_resume_draft(result_dict: dict) -> dict:
    """Add stable presentation keys without changing user-provided resume facts."""
    for index, item in enumerate(result_dict["experience"]):
        item["id"] = f"ai-exp-{index}"
    for index, item in enumerate(result_dict["education"]):
        item["id"] = f"ai-edu-{index}"
    for index, item in enumerate(result_dict["projects"]):
        item["id"] = f"ai-project-{index}"
    return result_dict


@router.post("/generate")
async def generate_resume_draft(req: GenerateResumeRequest, current_user=Depends(get_current_user)):
    if not builder_ai_enabled():
        return build_factual_draft_fallback(req)
    try:
        client = get_genai_client()
    except HTTPException:
        return build_factual_draft_fallback(req)
    
    prompt = f"""
You are an expert resume writer. Turn the following raw notes into a fully structured professional resume draft.
Target Role: {req.target_role or 'Not specified'}

RAW EXPERIENCE:
{req.raw_experience}

RAW PROJECTS:
{req.raw_projects}

RAW EDUCATION:
{req.raw_education}

KNOWN SKILLS:
{', '.join(req.known_skills) if req.known_skills else 'None provided'}

INSTRUCTIONS:
1. Turn the raw experience and projects into properly written resume bullet points (use action verbs + quantified impact where possible).
2. Infer a strong, professional 'summary' based on the target role and provided background.
3. Infer a professional 'headline'.
4. Keep it truthful. Do NOT invent companies, dates, degrees, skills, certifications, achievements, contact details, or metrics.
5. If the user did not provide a name or contact detail, leave that field as an empty string. Never use placeholder people, companies, projects, or examples.
6. If a field is unknown, use an empty string or empty list. A target role may guide wording only; it is not evidence of user experience.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeDataSchema,
                temperature=0.7,
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini")
        
        # The response text should be valid JSON matching the schema
        return finalize_resume_draft(ResumeDataSchema.model_validate_json(response.text).model_dump())
    except Exception:
        # Rate limits and transient provider failures should never discard the
        # user's notes or make the builder unusable.
        return build_factual_draft_fallback(req)

class SuggestionsSchema(BaseModel):
    suggestions: List[str]

@router.post("/improve-section", response_model=ImproveSectionResponse)
async def improve_section(req: ImproveSectionRequest, current_user=Depends(get_current_user)):
    if not builder_ai_enabled():
        return {"suggestions": [req.current_text] if req.current_text.strip() else []}
    client = get_genai_client()
    
    context_str = ""
    if req.context:
        context_str = "\\nCONTEXT:\\n" + "\\n".join([f"{k}: {v}" for k, v in req.context.items()])

    prompt = f"""
You are an expert resume reviewer. Please rewrite the following {req.section_type} text to be more impactful, concise, and professional. 
Provide 3 different variations of the rewrite so the user has options.

CURRENT TEXT:
{req.current_text}
{context_str}

Ensure the rewrites are truthful but use strong action verbs.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SuggestionsSchema,
                temperature=0.8,
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini")
            
        result_dict = json.loads(response.text)
        return {"suggestions": result_dict.get("suggestions", [])}
    except Exception as e:
        print("Improve error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# --- Section-Specific Parsing Models ---

class ParseSectionRequest(BaseModel):
    section_type: Literal['personal', 'summary', 'experience', 'education', 'projects', 'skills']
    user_prompt: str

class PersonalSectionSchema(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    headline: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class SummarySectionSchema(BaseModel):
    summary: str

class EducationSectionSchema(BaseModel):
    education: List[EducationItem]

class ExperienceSectionSchema(BaseModel):
    experience: List[ExperienceItem]

class ProjectsSectionSchema(BaseModel):
    projects: List[ProjectItem]

class SkillsSectionSchema(BaseModel):
    skills: List[str]


def local_section_defaults(section_type: str) -> dict:
    if section_type == "personal":
        return PersonalSectionSchema().model_dump()
    if section_type == "summary":
        return {"summary": ""}
    if section_type == "skills":
        return {"skills": []}
    return {section_type: []}


@router.post("/parse-section")
async def parse_section_from_casual_text(req: ParseSectionRequest, current_user=Depends(get_current_user)):
    if not builder_ai_enabled():
        return local_section_defaults(req.section_type)
    client = get_genai_client()
    
    schema_map = {
        'personal': PersonalSectionSchema,
        'summary': SummarySectionSchema,
        'education': EducationSectionSchema,
        'experience': ExperienceSectionSchema,
        'projects': ProjectsSectionSchema,
        'skills': SkillsSectionSchema,
    }
    
    selected_schema = schema_map.get(req.section_type)
    if not selected_schema:
        raise HTTPException(status_code=400, detail=f"Unsupported section_type: {req.section_type}")

    prompt = f"""
You are an expert resume assistant. The user is describing their {req.section_type} in casual, unstructured text.
Extract, clean up, and polish the details into a professional structure according to the JSON schema.

CASUAL USER INPUT:
"{req.user_prompt}"

INSTRUCTIONS:
1. Extract all relevant details truthfully and format them professionally.
2. Use active verbs and quantify impact where applicable (especially for experience & projects).
3. If details are missing or unspecified, leave optional fields as empty strings or empty lists (do NOT fabricate fake companies or institutions).
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=selected_schema,
                temperature=0.4,
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini")
            
        return json.loads(response.text)
    except Exception as e:
        print(f"Parse section error ({req.section_type}):", e)
        raise HTTPException(status_code=500, detail=str(e))
