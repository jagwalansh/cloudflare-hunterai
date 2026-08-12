from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from engine.preference_extractor import PreferenceFilters

import os
import json
from typing import List, Dict, Any, Set

def load_profiles(file_path: str) -> List[Dict[str, Any]]:
    """
    Loads user profiles from a JSON file.
    
    Args:
        file_path: Absolute or relative path to the user profiles JSON file.
        
    Returns:
        A list of dictionaries representing user profiles.
    """
    if not os.path.exists(file_path):
        print(f"Warning: Profiles file not found at {file_path}. Returning empty list.")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []
    except Exception as e:
        print(f"Error loading profiles from {file_path}: {e}")
        return []

def load_jobs(file_path: str) -> List[Dict[str, Any]]:
    """
    Loads jobs from a JSON file.
    
    Args:
        file_path: Absolute or relative path to the jobs JSON file.
        
    Returns:
        A list of dictionaries representing jobs.
    """
    if not os.path.exists(file_path):
        print(f"Warning: Jobs file not found at {file_path}. Returning empty list.")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []
    except Exception as e:
        print(f"Error loading jobs from {file_path}: {e}")
        return []

# Unidirectional Skill Satisfaction Matrix
# Key: The required job skill
# Value: The list of user skills that STRICTLY satisfy that requirement.
# Example: If job requires "deep learning", user MUST have "deep learning" or "pytorch". "machine learning" is not enough.
SKILL_SATISFACTION_MAP = {
    "deep learning": ["deep learning", "neural networks", "neural network", "tensorflow", "pytorch", "keras", "cnn", "rnn", "computer vision"],
    "data science": ["data science", "pandas", "numpy", "matplotlib", "seaborn", "data analysis", "data analytics", "data scientist"],
    "machine learning": ["machine learning", "ml", "deep learning", "tensorflow", "pytorch", "scikit", "scikit-learn", "regression", "model", "nlp"],
    "artificial intelligence": ["artificial intelligence", "ai", "machine learning", "deep learning", "llm", "genai", "generative ai"],
    "ai": ["ai", "artificial intelligence", "machine learning", "deep learning", "llm", "genai", "generative ai"],
    "python": ["python", "django", "flask", "fastapi", "pytest", "numpy", "pandas", "pytorch", "tensorflow"],
    "web development": ["web development", "react", "next.js", "nextjs", "angular", "vue", "node", "express", "html", "css", "js", "javascript", "typescript", "web", "website", "django", "flask", "frontend", "backend"],
    "frontend": ["frontend", "front-end", "react", "next.js", "angular", "vue", "html", "css", "javascript", "typescript", "tailwind"],
    "backend": ["backend", "back-end", "node", "express", "django", "flask", "fastapi", "spring boot", "java", "python", "go", "ruby"],
    "software engineering": ["software engineering", "java", "c++", "c#", "python", "go", "rust", "algorithm", "data structures", "system design", "docker", "kubernetes", "git"],
    # --- HR & Talent Acquisition ---
    "human resources": ["human resources", "hr", "talent acquisition", "recruiting", "recruitment", "onboarding", "payroll", "hris", "employee relations", "people operations"],
    "hr": ["hr", "human resources", "talent acquisition", "recruiting", "recruitment", "onboarding", "payroll", "hris", "people operations"],
    "talent acquisition": ["talent acquisition", "recruiting", "recruitment", "sourcing", "linkedin recruiter", "applicant tracking", "ats", "hiring", "headhunting", "hr"],
    "recruiting": ["recruiting", "talent acquisition", "sourcing", "linkedin recruiter", "applicant tracking", "ats", "hiring", "headhunting"],
    "payroll": ["payroll", "hr", "hris", "compensation", "benefits", "sap hr", "workday"],
    # --- Consulting & Strategy ---
    "consulting": ["consulting", "management consulting", "strategy", "business analysis", "business analyst", "advisory", "stakeholder management", "problem solving", "presentation", "ppt", "powerpoint"],
    "management consulting": ["management consulting", "consulting", "strategy", "mck", "bcg", "bain", "business analysis", "advisory"],
    "business analysis": ["business analysis", "business analyst", "requirements gathering", "process improvement", "stakeholder management", "use cases", "sql", "excel", "data analysis"],
    "strategy": ["strategy", "consulting", "business development", "market research", "competitive analysis", "go-to-market", "planning"],
    # --- Business Development & Sales ---
    "business development": ["business development", "bd", "sales", "crm", "lead generation", "negotiation", "partnerships", "key account management", "client relations"],
    "sales": ["sales", "business development", "crm", "lead generation", "negotiation", "key account management", "client relations", "b2b", "b2c"],
    "crm": ["crm", "salesforce", "hubspot", "zoho", "pipedrive", "customer relationship", "sales"],
    # --- Marketing & Communications ---
    "marketing": ["marketing", "digital marketing", "seo", "sem", "social media", "content marketing", "email marketing", "brand management", "market research", "google analytics"],
    "digital marketing": ["digital marketing", "seo", "sem", "google ads", "facebook ads", "social media", "content marketing", "email marketing", "analytics"],
    "communication": ["communication", "presentation", "public speaking", "writing", "copywriting", "stakeholder management", "cross-functional"],
    # --- Finance & Accounting ---
    "finance": ["finance", "financial analysis", "financial modeling", "excel", "accounting", "budgeting", "forecasting", "investment", "valuation", "cfa", "ca"],
    "financial analysis": ["financial analysis", "financial modeling", "excel", "valuation", "dcf", "bloomberg", "accounting", "finance"],
    "accounting": ["accounting", "tally", "gst", "taxation", "audit", "finance", "bookkeeping", "sap fi"],
    # --- Operations & Project Management ---
    "project management": ["project management", "pmp", "agile", "scrum", "jira", "trello", "stakeholder management", "risk management", "ms project", "planning"],
    "operations": ["operations", "process improvement", "lean", "six sigma", "supply chain", "logistics", "inventory", "project management"],
    "supply chain": ["supply chain", "logistics", "inventory", "procurement", "vendor management", "erp", "sap", "operations"],
}

import re

def _is_skill_match(user_skill: str, term: str) -> bool:
    if term == user_skill:
        return True
    # If the term is very short (like rest, api, git, ml, nlp, ai), use word boundaries
    if len(term) <= 4 or len(user_skill) <= 4:
        pattern = r'\b' + re.escape(term) + r'\b'
        return bool(re.search(pattern, user_skill))
    return term in user_skill or user_skill in term

def calculate_match(user_skills: List[str], job_skills: List[str]) -> Dict[str, Any]:
    """
    Compares user skills against job required skills using a unidirectional strict satisfaction matrix.
    Basic skills will NOT trigger a match for advanced roles.
    """
    valid_job_skills = [s for s in job_skills if s and str(s).strip()]
    if not valid_job_skills:
        return {
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": []
        }
        
    normalized_user_skills: List[str] = [skill.strip().lower() for skill in user_skills if skill]
    
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    
    for req_skill in valid_job_skills:
        normalized_req = req_skill.strip().lower()
        
        # 1. Start with the literal requirement itself
        valid_satisfying_terms = [normalized_req]
        
        # 2. Add specific terms that strictly satisfy this requirement from our unidirectional map
        if normalized_req in SKILL_SATISFACTION_MAP:
            valid_satisfying_terms.extend(SKILL_SATISFACTION_MAP[normalized_req])
            
        # Optional: Clean up duplicates
        valid_satisfying_terms = list(set(valid_satisfying_terms))
        
        matched = False
        for user_skill in normalized_user_skills:
            for term in valid_satisfying_terms:
                if _is_skill_match(user_skill, term):
                    # Prevent overly broad matches like "c" in "react"
                    if len(user_skill) <= 2 and user_skill != term:
                        continue
                    if len(term) <= 2 and term != user_skill:
                        continue
                    matched = True
                    break
            if matched:
                break
                
        if matched:
            matched_skills.append(req_skill)
        else:
            missing_skills.append(req_skill)
            
    num_matched = len(matched_skills)
    num_required = max(len(valid_job_skills), 4) # Assume at least 4 skills for any job to prevent 100% scores on 1-skill jobs
    
    match_score = round((num_matched / num_required) * 100, 2)
    
    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }

def check_dealbreakers(job_constraints: Dict[str, Any], user_profile: Dict[str, Any]) -> List[str]:
    """
    Checks hard constraints (PhD, Work Mode, Dealbreakers list) against the user profile.
    Returns a list of reasons why the candidate is not eligible. Empty list means eligible.
    """
    if not job_constraints:
        return []
        
    reasons = []
    
    # Check PhD Requirement
    if job_constraints.get("requires_phd", False):
        # Very simple check: does the user have "phd" or "doctorate" in their education?
        education = user_profile.get("education", [])
        has_phd = any("phd" in str(edu).lower() or "doctorate" in str(edu).lower() for edu in education)
        if not has_phd:
            reasons.append("This role explicitly requires a PhD or Doctorate degree.")
            
    # Check Work Mode (if onsite, check if they are in the city, or if we had a relocation willingness flag. For now just warn)
    work_mode = job_constraints.get("work_mode")
    location_city = job_constraints.get("location_city")
    
    # We could add more checks here based on user_profile.location etc.
    
    # Append any manual dealbreakers Groq found
    dealbreakers = job_constraints.get("dealbreakers", [])
    for db in dealbreakers:
        # We just list them as reasons for now since they are dynamic rules we can't easily eval in Python without an LLM.
        # But for hard constraints, this is useful.
        pass
        
    return reasons

def calculate_selection_probability_penalty(user_profile: Dict[str, Any], job: Dict[str, Any], score: float, num_matched_projects: int) -> float:
    penalty = 0.0
    title = job.get("job_title", "").lower()
    
    # 1. Seniority Check: If the title contains "Senior", "Lead", "Manager", "Architect", or "Sr.",
    # and the candidate is a student (experience is empty/short), apply a heavy penalty.
    experience = user_profile.get("experience", [])
    is_student = len(experience) == 0 or any(
        "intern" in str(exp.get("role", "")).lower() or any(kw in str(exp.get("description", "")).lower() for kw in ["student", "study", "university", "college"])
        for exp in experience if isinstance(exp, dict)
    )
    
    education = user_profile.get("education", [])
    is_current_student = any(
        any(c.isdigit() for c in str(edu.get("year", ""))) and "202" in str(edu.get("year", ""))
        for edu in education if isinstance(edu, dict)
    )
    
    if (is_student or is_current_student) and any(sk in title for sk in ["senior", "lead", "manager", "architect", "sr.", "principal"]):
        penalty += 35.0
        
    # 2. Project Relevance Penalty:
    # If the job requires a skill, and they match it but have ZERO matching projects in the domain,
    # reduce the score. Having projects proves practical capability.
    if num_matched_projects == 0 and score > 0:
        specific_roles = ["machine learning", "ml", "ai", "data science", "react", "frontend", "flutter", "java", "python", "backend"]
        if any(r in title for r in specific_roles):
            penalty += 25.0
            
    # 3. Core Tech Mismatch Penalty:
    # If the job title explicitly names a technology (e.g. "React Intern", "Flutter Developer", "Java Developer"),
    # and the candidate does NOT have this technology in their skills list:
    skills_lower = [s.lower() for s in user_profile.get("skills", [])]
    core_techs = ["react", "flutter", "java", "python", "c++", "angular", "node", "android", "ios", "machine learning", "ml", "aws", "docker"]
    for tech in core_techs:
        if tech in title:
            # Check if this tech or a synonym is in skills
            has_tech = False
            for s in skills_lower:
                if tech in s or (tech == "ml" and "machine learning" in s) or (tech == "machine learning" and "ml" in s):
                    has_tech = True
                    break
            if not has_tech:
                penalty += 30.0
                
    final_score = max(0.0, score - penalty)
    return round(final_score, 2)

def evaluate_suitability(user_profile: Dict[str, Any], job: Dict[str, Any], keyword: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluates candidate suitability for a job based on an industry-standard ATS scoring algorithm (100 points max).
    - Strict Skills Match (explicit + implicit from title): 35%
    - Keyword Density Match: 25%
    - Work Experience / Project Relevance: 20%
    - Education & Certifications: 10%
    - Resume Formatting / Completeness: 10%
    """
    user_skills = user_profile.get("skills", [])
    job_skills_raw = job.get("required_skills", [])
    
    # ── IMPLICIT SKILL EXTRACTION FROM JOB TITLE ──
    # Many scraped jobs only list 1-2 required skills, but the title implies much more.
    # e.g. "Python Full Stack Developer" implies: python, frontend, backend, database, api, web development
    job_title = str(job.get("job_title", "")).lower()
    
    TITLE_IMPLIED_SKILLS = {
        "full stack": ["frontend", "backend", "html", "css", "javascript", "api", "database", "web development"],
        "frontend": ["html", "css", "javascript", "react", "ui", "responsive design"],
        "backend": ["api", "database", "server", "rest", "sql"],
        "data scientist": ["python", "machine learning", "statistics", "pandas", "numpy", "data analysis"],
        "data analyst": ["sql", "excel", "python", "data visualization", "statistics", "tableau"],
        "devops": ["docker", "kubernetes", "ci/cd", "aws", "linux", "terraform", "jenkins"],
        "machine learning": ["python", "tensorflow", "pytorch", "scikit-learn", "deep learning", "model training"],
        "ai engineer": ["python", "machine learning", "deep learning", "nlp", "llm", "neural networks"],
        "software engineer": ["data structures", "algorithms", "git", "testing", "system design"],
        "web developer": ["html", "css", "javascript", "responsive design", "api", "web development"],
        "mobile": ["android", "ios", "react native", "flutter"],
        "cloud": ["aws", "azure", "gcp", "docker", "kubernetes"],
        "product manager": ["roadmap", "agile", "stakeholder management", "user research", "analytics"],
        "ui/ux": ["figma", "wireframing", "user research", "prototyping", "design thinking"],
        "designer": ["figma", "adobe", "wireframing", "prototyping", "visual design"],
        # --- HR & Talent ---
        "hr": ["hr", "human resources", "recruiting", "talent acquisition", "onboarding", "employee relations", "hris", "payroll"],
        "human resource": ["human resources", "hr", "recruiting", "talent acquisition", "onboarding", "employee relations", "hris", "payroll"],
        "talent acquisition": ["recruiting", "sourcing", "linkedin recruiter", "applicant tracking", "ats", "hr", "hiring"],
        "recruiter": ["recruiting", "sourcing", "talent acquisition", "linkedin recruiter", "hr", "communication"],
        # --- Consulting & Strategy ---
        "consultant": ["consulting", "strategy", "business analysis", "stakeholder management", "presentation", "powerpoint", "excel", "communication"],
        "consulting": ["strategy", "business analysis", "problem solving", "presentation", "stakeholder management", "excel", "powerpoint"],
        "strategy": ["business analysis", "market research", "competitive analysis", "consulting", "excel", "powerpoint"],
        "business analyst": ["business analysis", "requirements gathering", "sql", "excel", "process improvement", "stakeholder management", "use cases"],
        # --- Business Development & Sales ---
        "business development": ["bd", "sales", "crm", "lead generation", "negotiation", "partnerships", "communication"],
        "sales": ["crm", "lead generation", "negotiation", "b2b", "client relations", "communication", "business development"],
        # --- Marketing ---
        "marketing": ["seo", "sem", "social media", "content marketing", "email marketing", "google analytics", "brand management", "market research"],
        "digital marketing": ["seo", "sem", "google ads", "social media", "content marketing", "email marketing", "analytics"],
        "content": ["content writing", "copywriting", "seo", "social media", "blogging", "communication"],
        "brand": ["brand management", "marketing", "social media", "communication", "design"],
        # --- Finance & Accounting ---
        "finance": ["financial analysis", "financial modeling", "excel", "accounting", "budgeting", "forecasting", "valuation"],
        "financial analyst": ["financial modeling", "excel", "valuation", "dcf", "bloomberg", "accounting", "finance"],
        "accounting": ["tally", "gst", "taxation", "audit", "bookkeeping", "excel", "sap fi"],
        # --- Operations & Project Management ---
        "project manager": ["project management", "agile", "scrum", "jira", "stakeholder management", "risk management", "planning"],
        "operations": ["process improvement", "lean", "supply chain", "logistics", "inventory", "project management"],
        "supply chain": ["logistics", "inventory", "procurement", "vendor management", "erp", "sap", "operations"],
    }
    
    implied_skills = set()
    for title_keyword, skills in TITLE_IMPLIED_SKILLS.items():
        if title_keyword in job_title:
            implied_skills.update(skills)
    
    # Also add each word from the job title as a keyword if it's meaningful
    title_words = [w for w in job_title.split() if len(w) > 2 and w not in {"the", "and", "for", "with", "intern", "internship", "job", "role", "position", "developer", "engineer"}]
    implied_skills.update(title_words)
    
    # Combine explicit required skills with implicit title-derived skills
    all_required_skills = list(set([s.strip() for s in job_skills_raw if s and str(s).strip()]))
    implicit_only = [s for s in implied_skills if s.lower() not in [r.lower() for r in all_required_skills]]
    
    # ── 1. STRICT SKILLS MATCH (35 points max) ──
    # Score against explicit required_skills (primary weight)
    match_result = calculate_match(user_skills, all_required_skills)
    explicit_skills_ratio = match_result["match_score"] / 100.0  # 0.0 to 1.0
    
    # Also score against implicit title-derived skills (secondary weight)
    if implicit_only:
        implicit_match = calculate_match(user_skills, implicit_only)
        implicit_ratio = implicit_match["match_score"] / 100.0
    else:
        implicit_ratio = explicit_skills_ratio  # no implicit skills to check
    
    # Weighted blend: explicit skills matter more, but implicit skills provide differentiation
    blended_skills_ratio = (explicit_skills_ratio * 0.6) + (implicit_ratio * 0.4)
    skills_score = blended_skills_ratio * 35.0
    
    # ── 2. KEYWORD DENSITY MATCH (25 points max) ──
    # Build a rich set of keywords from job title + required skills + implied skills
    all_job_keywords = set()
    all_job_keywords.update([s.lower() for s in all_required_skills if s])
    all_job_keywords.update([s.lower() for s in implied_skills if s])
    # Add meaningful words from job title
    all_job_keywords.update(title_words)
    # Remove very short or generic terms
    all_job_keywords = {k for k in all_job_keywords if len(k) > 2}
    
    # Build the full user text corpus from skills + projects + experience
    user_text_parts = []
    user_text_parts.extend([str(s).lower() for s in user_skills])
    
    projects = user_profile.get("projects", [])
    matched_projects = []
    
    query = (keyword or job_title).strip().lower()
    search_terms = [query]
    for key, synonyms in SKILL_SATISFACTION_MAP.items():
        if key in query or any(syn in query for syn in [key] + synonyms):
            search_terms.extend(synonyms)
    search_terms = list(set([t.lower() for t in search_terms if t]))
    
    for proj in projects:
        if isinstance(proj, str):
            proj = {"title": proj, "description": "", "technologies": []}
        elif not isinstance(proj, dict):
            continue
            
        proj_title_val = str(proj.get("title") or proj.get("name") or proj.get("project") or "").lower()
        raw_desc = proj.get("description") or proj.get("summary") or ""
        proj_desc = " ".join(raw_desc) if isinstance(raw_desc, list) else str(raw_desc)
        proj_desc = proj_desc.lower()
        
        raw_techs = proj.get("technologies") or proj.get("techStack") or []
        proj_techs = [str(t).lower() for t in raw_techs if t]
        
        user_text_parts.extend([proj_title_val, proj_desc] + proj_techs)
        
        is_relevant = False
        for term in search_terms:
            if term in proj_title_val or term in proj_desc or any(term in tech for tech in proj_techs):
                if len(term) <= 2 and term not in proj_techs:
                    continue
                is_relevant = True
                break
        if is_relevant:
            matched_projects.append(proj.get("title") or "Unnamed Project")
    
    # Also include experience descriptions in user text
    experience = user_profile.get("experience", [])
    for exp in experience:
        if isinstance(exp, dict):
            exp_role = str(exp.get("role", "") or exp.get("title", "")).lower()
            exp_desc = exp.get("description") or exp.get("summary") or ""
            if isinstance(exp_desc, list):
                exp_desc = " ".join(exp_desc)
            user_text_parts.extend([exp_role, str(exp_desc).lower()])
    
    user_text_str = " ".join(user_text_parts)
    
    # Granular keyword scoring: count how many distinct job keywords appear
    keyword_hits = 0
    if all_job_keywords:
        for kw in all_job_keywords:
            if kw in user_text_str:
                keyword_hits += 1
        # Require 75% of keywords to get max points, and assume at least 5 keywords
        hit_ratio = keyword_hits / max(len(all_job_keywords), 5)
        keyword_score = min((hit_ratio / 0.75) * 25.0, 25.0)
    else:
        keyword_score = 5.0
    
    num_matched_projects = len(matched_projects)
    
    # ── 3. WORK EXPERIENCE / PROJECT RELEVANCE (20 points max) ──
    # Graduated scoring instead of binary
    experience_score = 0.0
    has_experience = len(experience) > 0
    
    if has_experience:
        experience_score += 3.0  # Reduced base points for having any experience
        # Bonus for relevant experience (check if role titles match)
        for exp in experience:
            if isinstance(exp, dict):
                exp_role = str(exp.get("role", "") or exp.get("title", "")).lower()
                if any(term in exp_role for term in search_terms if len(term) > 2):
                    experience_score += 5.0
                    break
    
    # Project relevance scoring (graduated, tougher)
    if num_matched_projects >= 4:
        experience_score += 15.0
    elif num_matched_projects == 3:
        experience_score += 12.0
    elif num_matched_projects == 2:
        experience_score += 8.0
    elif num_matched_projects == 1:
        experience_score += 4.0
    elif len(projects) > 0:
        experience_score += 0.0  # No free points if projects aren't matched
    
    experience_score = min(experience_score, 20.0)
    
    # ── 4. EDUCATION & CERTIFICATIONS (10 points max) ──
    education = user_profile.get("education", [])
    education_score = 10.0 if len(education) > 0 else 0.0
    
    # ── 5. RESUME COMPLETENESS (10 points max) ──
    completeness_score = 0.0
    if len(user_skills) > 0: completeness_score += 1.0
    if len(user_skills) >= 8: completeness_score += 2.0  # Tougher bonus for having many skills
    if len(projects) > 0: completeness_score += 1.0
    if len(projects) >= 3: completeness_score += 2.0  # Tougher bonus for multiple projects
    if len(experience) > 0: completeness_score += 2.0
    if len(education) > 0: completeness_score += 2.0
    completeness_score = min(completeness_score, 10.0)
    
    # ── BASE ATS SCORE ──
    raw_ats_score = keyword_score + skills_score + experience_score + education_score + completeness_score
    
    # Apply selection probability penalties
    score = calculate_selection_probability_penalty(user_profile, job, raw_ats_score, num_matched_projects)
    
    # Check Hard Constraints (Dealbreakers)
    job_constraints = job.get("constraints", {})
    dealbreaker_reasons = check_dealbreakers(job_constraints, user_profile)
    
    if dealbreaker_reasons:
        score = 0.0
        assessment = f"Not Eligible: {dealbreaker_reasons[0]}"
        suitability_level = "not_suited"
    else:
        if score >= 75:
            assessment = f"Highly Suited: ATS Score {int(score)}/100. Excellent keyword match and skills alignment."
            suitability_level = "highly_suited"
        elif score >= 50:
            if num_matched_projects == 0:
                assessment = f"Partially Suited: ATS Score {int(score)}/100. Good skills, but lacking relevant projects."
                suitability_level = "partially_suited"
            else:
                assessment = f"Partially Suited: ATS Score {int(score)}/100. Average keyword and experience match."
                suitability_level = "partially_suited"
        else:
            assessment = f"Not Suited: ATS Score {int(score)}/100. Missing core keywords, skills, or experience."
            suitability_level = "not_suited"
        
    return {
        "score": round(score, 2),
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "matched_projects": matched_projects,
        "suitability_assessment": assessment,
        "suitability_level": suitability_level
    }

def rank_jobs(user_profile: Dict[str, Any], jobs: List[Dict[str, Any]], keyword: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Compares a single user profile against a list of jobs, calculates match scores,
    and returns the jobs sorted by score in descending order.
    """
    ranked_list: List[Dict[str, Any]] = []
    
    for job in jobs:
        suitability = evaluate_suitability(user_profile, job, keyword)
        
        ranked_list.append({
            "id": job.get("id"),
            "job_title": job.get("job_title", "Unknown Job"),
            "company": job.get("company", "Unknown Company"),
            "stipend": job.get("stipend", "Negotiable"),
            "location": job.get("location", "Remote"),
            "url": job.get("url", ""),
            "duration": job.get("duration", "Not specified"),
            "source": job.get("source", "Internshala"),
            "score": suitability["score"],
            "matched_skills": suitability["matched_skills"],
            "missing_skills": suitability["missing_skills"],
            "matched_projects": suitability["matched_projects"],
            "suitability_assessment": suitability["suitability_assessment"],
            "suitability_level": suitability["suitability_level"]
        })
        
    # Sort descending by match score
    ranked_list.sort(key=lambda x: x["score"], reverse=True)
    return ranked_list

# Demonstration and basic testing logic
if __name__ == "__main__":
    # Sample Test Data
    sample_user = {
        "name": "Shaurya Mishra",
        "skills": ["Python", "FastAPI", "LangChain"]
    }
    
    sample_jobs = [
        {
            "job_title": "Backend Intern",
            "required_skills": ["Python", "FastAPI", "SQL"]
        },
        {
            "job_title": "Python Intern",
            "required_skills": ["Python", "Django"]
        },
        {
            "job_title": "Data Intern",
            "required_skills": ["Python", "Pandas", "SQL", "Machine Learning"]
        }
    ]
    
    print("--- Testing calculate_match ---")
    match_res = calculate_match(sample_user["skills"], sample_jobs[0]["required_skills"])
    print(json.dumps(match_res, indent=4))
    
    print("\n--- Testing rank_jobs ---")
    ranked = rank_jobs(sample_user, sample_jobs)
    print(json.dumps(ranked, indent=4))
    
    # Try running on actual JSON files
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    profiles_path = os.path.join(project_root, "data", "user_profiles.json")
    jobs_path = os.path.join(project_root, "data", "jobs.json")
    
    if os.path.exists(profiles_path) and os.path.exists(jobs_path):
        print("\n--- Running End-to-End matching on JSON files ---")
        profiles = load_profiles(profiles_path)
        jobs = load_jobs(jobs_path)
        
        if profiles and jobs:
            user = profiles[0]
            print(f"Ranking jobs for user: {user.get('name', 'Unknown')}")
            real_ranked = rank_jobs(user, jobs)
            print(json.dumps(real_ranked, indent=4))


class Job(BaseModel):
    id: str
    title: str
    company: str
    location: str  # e.g. "San Francisco, CA" or "Remote"
    is_remote: bool
    stipend_monthly: Optional[int] = None
    description: str
    required_skills: List[str] = Field(default_factory=list)


class JobMatch(BaseModel):
    job: Job
    ats_score: float  # 0-100, from existing resume/skill matching
    match_score: float  # ats_score after preference boosts, capped at 100
    matched_preferences: List[str] = Field(default_factory=list)  # for UI transparency




# NEW: Preference-based hard filters
# ---------------------------------------------------------------------------


def _location_matches(job: Job, preferred_locations: List[str]) -> bool:
    if not preferred_locations:
        return True  # no location preference stated -> don't filter anything out

    wants_remote = any(loc.strip().lower() == "remote" for loc in preferred_locations)
    if wants_remote and job.is_remote:
        return True

    job_location = job.location.lower()
    return any(
        loc.strip().lower() in job_location
        for loc in preferred_locations
        if loc.strip().lower() != "remote"
    )


def apply_hard_filters(jobs: List[Job], preferences: PreferenceFilters) -> List[Job]:
    """Drop any job that violates a strict, explicitly stated preference."""
    filtered: List[Job] = []

    for job in jobs:
        if not _location_matches(job, preferences.preferred_locations):
            continue

        if preferences.min_stipend_monthly is not None:
            if job.stipend_monthly is None or job.stipend_monthly < preferences.min_stipend_monthly:
                continue

        if preferences.must_have:
            haystack = f"{job.title} {job.description}".lower()
            if not all(req.lower() in haystack for req in preferences.must_have):
                continue

        filtered.append(job)

    return filtered


# ---------------------------------------------------------------------------
# NEW: Preference-based soft ranking
# ---------------------------------------------------------------------------

ROLE_KEYWORD_BOOST = 0.15  # +15% match score for a role keyword hit
LOCATION_BOOST = 0.05  # +5% extra for an exact, non-remote location hit


def apply_soft_ranking(
    jobs: List[Job],
    preferences: PreferenceFilters,
    base_scores: Dict[str, float],
) -> List[JobMatch]:
    """
    Take ATS base scores and boost them where a job aligns with soft
    (non-strict) preferences, returning fully-formed JobMatch objects.
    """
    matches: List[JobMatch] = []

    for job in jobs:
        base = base_scores.get(job.id, 0.0)
        score = base
        matched: List[str] = []

        haystack = f"{job.title} {job.description}".lower()
        if any(kw.lower() in haystack for kw in preferences.role_keywords):
            score *= 1 + ROLE_KEYWORD_BOOST
            matched.append("role_keyword")

        non_remote_locations = [
            loc for loc in preferences.preferred_locations if loc.lower() != "remote"
        ]
        if non_remote_locations and any(
            loc.lower() in job.location.lower() for loc in non_remote_locations
        ):
            score *= 1 + LOCATION_BOOST
            matched.append("preferred_location")

        matches.append(
            JobMatch(
                job=job,
                ats_score=base,
                match_score=round(min(score, 100.0), 2),
                matched_preferences=matched,
            )
        )

    return matches


# ---------------------------------------------------------------------------
# NEW: Single entry point used by the /api/recommendations/preferences route
# ---------------------------------------------------------------------------



def get_ranked_jobs_for_user(
    user_id: str, preferences: Optional[PreferenceFilters] = None
) -> List[JobMatch]:
    preferences = preferences or PreferenceFilters()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    profiles_path = os.path.join(project_root, "data", "user_profiles.json")
    jobs_path = os.path.join(project_root, "data", "jobs.json")
    
    profiles = load_profiles(profiles_path)
    jobs = load_jobs(jobs_path)
    
    user = next((p for p in profiles if p.get("id") == user_id or p.get("name") == "Shaurya Mishra"), None)
    if not user and profiles:
        user = profiles[0]
        
    real_ranked = rank_jobs(user, jobs)
    
    # Convert dictionaries to Job objects for the preference filter
    job_objects = []
    base_scores = {}
    
    for r in real_ranked:
        # Map our dict to the Job pydantic model
        import hashlib
        jid = hashlib.md5(f"{r['job_title']}_{r['company']}_{len(job_objects)}".encode()).hexdigest()
        
        # safely parse stipend
        stipend_val = None
        s_str = str(r.get("stipend", "")).lower()
        import re
        nums = re.findall(r'\d+', s_str)
        if nums:
            stipend_val = int(nums[0])
            if stipend_val < 100: stipend_val *= 1000 # quick fix for "10k"
            
        is_remote = "remote" in r.get("location", "").lower()
            
        j_obj = Job(
            id=jid,
            title=r["job_title"],
            company=r["company"],
            location=r["location"],
            is_remote=is_remote,
            stipend_monthly=stipend_val,
            description="",
            required_skills=r["matched_skills"] + r["missing_skills"]
        )
        job_objects.append(j_obj)
        base_scores[jid] = r["score"]
        
    eligible_jobs = apply_hard_filters(job_objects, preferences)
    ranked = apply_soft_ranking(eligible_jobs, preferences, base_scores)
    ranked.sort(key=lambda m: m.match_score, reverse=True)
    return ranked
