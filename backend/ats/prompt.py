def build_ats_prompt(resume_text: str, job_description: str = "") -> str:
    """
    Build prompt for LLM to evaluate ATS resume score against job description.
    """
    jd_section = f"\nJob Description:\n{job_description}\n" if job_description.strip() else "\nJob Description: Generic Software/Backend Engineer Intern position\n"

    prompt = f"""
You are an expert Applicant Tracking System (ATS) and Senior Technical Recruiter evaluator.

Evaluate the following resume against the job description.

Resume Text:
{resume_text}
{jd_section}

Provide a comprehensive, objective ATS evaluation. Return ONLY valid JSON with no extra commentary, matching this exact structure:

{{
    "overall_score": 82,
    "status": "Good",
    "categories": {{
        "keywords": 90,
        "skills": 81,
        "experience": 74,
        "grammar": 97,
        "formatting": 100
    }},
    "missing_keywords": [
        "Docker",
        "AWS",
        "Kubernetes",
        "CI/CD"
    ],
    "suggestions": [
        "Mention Docker projects.",
        "Add cloud experience.",
        "Use stronger action verbs.",
        "Quantify project achievements."
    ]
}}

Rules:
1. 'overall_score' must be an integer between 0 and 100.
2. 'status' must be one of: "Excellent", "Good", "Needs Improvement", "Poor".
3. 'categories' must contain scores (0-100) for: 'keywords', 'skills', 'experience', 'grammar', 'formatting'.
4. 'missing_keywords' must be a list of important missing technical terms/skills.
5. 'suggestions' must be a list of actionable bullet points to improve the resume.
6. Return ONLY the raw JSON object.
"""
    return prompt
