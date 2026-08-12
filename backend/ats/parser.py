import json
import re
from typing import List, Dict
from pydantic import BaseModel, Field

class CategoryScores(BaseModel):
    keywords: int = Field(default=80, ge=0, le=100)
    skills: int = Field(default=80, ge=0, le=100)
    experience: int = Field(default=80, ge=0, le=100)
    grammar: int = Field(default=95, ge=0, le=100)
    formatting: int = Field(default=95, ge=0, le=100)

class ATSResultModel(BaseModel):
    overall_score: int = Field(default=80, ge=0, le=100)
    status: str = Field(default="Good")
    categories: CategoryScores = Field(default_factory=CategoryScores)
    missing_keywords: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)

def parse_ats_json(raw_text: str) -> dict:
    """
    Clean raw LLM text output, parse JSON, and validate against Pydantic schema.
    """
    cleaned = raw_text.strip()
    
    if "```" in cleaned:
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"```\s*$", "", cleaned, flags=re.MULTILINE)
        cleaned = cleaned.strip()

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    try:
        data = json.loads(cleaned)
        validated = ATSResultModel(**data)
        return validated.model_dump()
    except Exception as e:
        print(f"[Parser] Pydantic/JSON parsing warning: {e}. Fallback triggered.")
        try:
            raw_dict = json.loads(cleaned)
            if isinstance(raw_dict, dict):
                return raw_dict
        except Exception:
            pass
        return ATSResultModel().model_dump()
