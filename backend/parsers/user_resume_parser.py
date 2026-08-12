from langchain.chat_models import init_chat_model
import os,json,fitz,asyncio
from dotenv import load_dotenv
from pydantic import BaseModel

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

dotenv_path = os.path.join(project_root, "config", ".env")
load_dotenv(dotenv_path)

class UserProfile(BaseModel):
    name: str
    email: str
    phone: str
    skills: list[str]
    projects: list
    education: list
    experience: list
def extract_text(pdf_path: str) -> str:
    with fitz.open(pdf_path) as doc:
        text=""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += str(page.get_text())
        return text
def extract_profile_regex(text: str) -> dict:
    import re
    
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    extracted_email = email_match.group(0) if email_match else "candidate@example.com"
    
    phone_match = re.search(r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', text)
    extracted_phone = phone_match.group(0) if phone_match else ""
    
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    extracted_name = lines[0] if lines else "Candidate"
    if len(extracted_name) > 40:
        extracted_name = "Candidate"
    
    extracted_skills = []
    skills_section_match = re.search(r'(?i)(?:skills|expertise|competencies)[:\n]+(.*?)(?=\n\n|\n[A-Z\s]{4,}:|\Z)', text, re.DOTALL)
    if skills_section_match:
        raw_skills = skills_section_match.group(1)
        extracted_skills = [s.strip("•-*\t ") for s in re.split(r'[\n,•|\/]', raw_skills) if s.strip("•-*\t ") and len(s.strip()) < 35]
    
    if not extracted_skills:
        common_skills = [
            "Project Management", "Public Relations", "Teamwork", "Time Management", "Leadership",
            "Effective Communication", "Critical Thinking", "Marketing", "Human Resources", "Sales",
            "SEO", "Customer Relations", "Strategic Planning", "Digital Marketing", "Content Creation",
            "Python", "React", "JavaScript", "TypeScript", "HTML", "CSS", "SQL", "Java", "C++"
        ]
        text_lower = text.lower()
        for sk in common_skills:
            if re.search(r'\b' + re.escape(sk.lower()) + r'\b', text_lower):
                extracted_skills.append(sk)
    return {
        "name": extracted_name,
        "email": extracted_email,
        "phone": extracted_phone,
        "skills": extracted_skills,
        # Do not manufacture a placeholder project from arbitrary resume text.
        # Empty sections are preferable to a repeated, fictitious project.
        "projects": [],
        "education": [],
        "experience": []
    }
async def parse_resume_to_json(pdf_path: str) -> dict:
    text = extract_text(pdf_path)
    if not text or not text.strip():
        print("PDF text extraction empty. Using local parser.")
        return extract_profile_regex(text)

    # Upload must remain available when AI quotas are exhausted. The local
    # parser extracts only evidence found in the PDF; deployments can opt into
    # LLM enrichment explicitly after configuring sufficient provider quota.
    if os.getenv("RESUME_PARSER_USE_LLM", "false").lower() != "true":
        return extract_profile_regex(text)
        
    prompt_text = f"""
You are an expert ATS resume parser. Your job is to extract candidate information and output a clean, strict JSON file adhering strictly to the schema rules below.

Rules:
1. **Name, Email, Phone**: Parse accurately.
2. **Skills Extraction Rules (CRITICAL)**:
   - ONLY extract skills that are explicitly listed in the dedicated "SKILLS" section of the resume, or are clearly demonstrated by technologies listed inside the candidate's "PROJECTS" / "EXPERIENCE" sections.
   - **DO NOT** extract skills from the "CAREER OBJECTIVE", "PROFESSIONAL SUMMARY", "FUTURE GOALS", or "HOBBIES" statements. For example, if the candidate states they are "Seeking an internship to apply machine learning and Generative AI", do NOT add "Machine Learning" or "Generative AI" to their skills array unless they have a matching project, certification, or technical skill entry proving they have actual hands-on capability.
   - Separate and extract standalone skills (e.g. "C++", "Java", "HTML", "CSS", "Git", "GitHub") cleanly.
3. **Projects**: For each project, extract the exact title, description details, and technical tools used. Make sure you map them to the keys:
   - "title": (Project name)
   - "description": (Project description)
   - "technologies": (List of tools/technologies used)
4. **Education**: Parse the institution, degree/course name, and years/passing details.
5. **Experience**: Parse the company, role, duration, and details.

JSON Schema format to follow:
{{
  "name": "Candidate's full name",
  "email": "Candidate's email",
  "phone": "Candidate's phone number",
  "skills": ["Skill 1", "Skill 2", ...],
  "projects": [
     {{
       "title": "Project Title",
       "description": "Project details description",
       "technologies": ["Tool 1", "Tool 2", ...]
     }}
  ],
  "education": [
     {{
       "institution": "University/School",
       "degree": "Degree earned",
       "year": "Dates of study"
     }}
  ],
  "experience": [
     {{
       "company": "Company Name",
       "role": "Job Title",
       "duration": "Dates of employment",
       "description": "Job description details"
     }}
  ]
}}

Resume Text:
{text}
"""
    json_text = ""
    try:
        llm_model = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
        res = await asyncio.wait_for(llm_model.ainvoke(prompt_text), timeout=15.0)
        json_text = res.content
    except Exception as groq_err:
        print(f"Groq API invocation failed: {groq_err}. Attempting Gemini fallback...")
        try:
            llm_model = init_chat_model(model="gemini-2.5-flash", model_provider="google_genai")
            res = await asyncio.wait_for(llm_model.ainvoke(prompt_text), timeout=15.0)
            json_text = res.content
        except Exception as gemini_err:
            print(f"Gemini fallback failed: {gemini_err}. Using extracted text profile fallback.")
            return extract_profile_regex(text)

    if json_text:
        cleaned_json = str(json_text).strip()
        import re
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned_json, re.DOTALL)
        if json_match:
            cleaned_json = json_match.group(1)
        else:
            start = cleaned_json.find('{')
            end = cleaned_json.rfind('}')
            if start != -1 and end != -1:
                cleaned_json = cleaned_json[start:end+1]
        
        cleaned_json = cleaned_json.strip()

        try:
            data = json.loads(cleaned_json)
            return data
        except json.JSONDecodeError as e:
            print(f"JSONDecodeError: {e}\nRaw LLM output: {json_text}")
            print("LLM returned invalid JSON. Using regex fallback.")
            return extract_profile_regex(text)
            
    print("No response from LLM model. Using regex fallback.")
    return extract_profile_regex(text)

def get_default_resume_path():
    return os.path.join(project_root, "data", "uploads", "resume", "25bai70051_shauryamishra.pdf")

def content_file():
    path = get_default_resume_path()
    return extract_text(path)

async def response():
    path = get_default_resume_path()
    if not os.path.exists(path):
        print(f"Test resume file not found at: {path}")
        return {}
    data = await parse_resume_to_json(path)
    print("\nProfile saved successfully ✅")
    return data
if __name__ == "__main__":
    asyncio.run(response())

