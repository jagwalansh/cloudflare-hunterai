from typing import Union, Dict, Any
from ats.extractor import extract_resume_text
from ats.scorer import score_resume
def calculate_ats_score(resume_file: Union[str, bytes], job_description: str = "") -> Dict[str, Any]:
    """
    Fast, deterministic ATS evaluation pipeline.
    """
    text = extract_resume_text(resume_file)
    if not text:
        text = "No resume text could be extracted."
    return score_resume(text, job_description)
async def calculate_ats_score_async(resume_file:Union[str, bytes], job_description: str = "") -> Dict[str, Any]:
    """
    Fast, deterministic ATS evaluation pipeline.
    """
    text = extract_resume_text(resume_file)
    if not text:
        text = "No resume text could be extracted."
    return score_resume(text, job_description)
