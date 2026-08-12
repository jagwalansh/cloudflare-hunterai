from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Literal
from pydantic import BaseModel, Field
import json
from groq import Groq

from routes.auth import get_current_user
from config.models import User, Profile
from config.database import get_db

router = APIRouter()

import os

# Get Groq API Key from environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Get Gemini API Key from environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

# Define Pydantic BaseModel for structured response
class ActionItem(BaseModel):
    category: str = Field(description="The category of the action item (e.g., 'Skills', 'Experience', 'Formatting')")
    suggestion: str = Field(description="A specific, actionable suggestion for improvement")

class ResumeInsights(BaseModel):
    overall_score: int = Field(description="An estimated score out of 100 based on the resume quality")
    strengths: List[str] = Field(description="A list of 3-5 key strengths of the resume")
    weaknesses: List[str] = Field(description="A list of areas that need improvement")
    action_items: List[ActionItem] = Field(description="Actionable steps the user can take to improve their resume")
    response_message: str = Field(description="A conversational response to the user's specific query")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_gemini(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please upload a resume first.")

    # Construct the context
    resume_context = f"""
    User Name: {current_user.username}
    Skills: {', '.join(profile.skills) if profile.skills else 'None listed'}
    Education: {profile.education}
    Experience: {profile.experience}
    Projects: {profile.projects}
    """

    system_prompt = f"""
    You are an expert career counselor and technical recruiter.
    The user is asking for insights on their resume and what changes need to be made.
    Here is their parsed resume data:
    {resume_context}
    
    The user's query is: "{request.message}"
    
    Analyze their resume carefully and provide a highly structured analysis directly answering their query.
    Always be encouraging but professionally honest about what is missing.
    
    You MUST respond with a valid JSON object matching this exact schema:
    {{
      "overall_score": int (out of 100),
      "strengths": [string, string, ...],
      "weaknesses": [string, string, ...],
      "action_items": [
        {{ "category": string, "suggestion": string }}
      ],
      "response_message": "A conversational response to the user's specific query"
    }}
    """

    # Try Groq first
    if client:
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Groq API Error: {e}")

    # Fallback to Gemini
    if GEMINI_API_KEY:
        try:
            import re
            from google import genai as google_genai
            gemini_client = google_genai.Client(api_key=GEMINI_API_KEY)
            gemini_resp = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_prompt}\nUser Query: {request.message}",
            )
            raw = gemini_resp.text or "{}"
            # Strip markdown fences if present
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw, re.DOTALL)
            raw = json_match.group(1) if json_match else raw[raw.find('{'):raw.rfind('}')+1]
            return json.loads(raw)
        except Exception as e:
            print(f"[Chat] Gemini fallback failed: {e}")

    raise HTTPException(status_code=500, detail="Failed to generate insights using all available AI services.")
