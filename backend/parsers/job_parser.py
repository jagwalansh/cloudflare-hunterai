from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os,json
path_env = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(path_env)
load_path_dotenv = os.path.join(project_root, "config", ".env")
load_dotenv(load_path_dotenv)
llm_model = init_chat_model(
    model="gemini-2.5-flash",
    model_provider="google_genai",
)


job_description = """
Python Developer Intern

Requirements:
- Python
- FastAPI
- SQL

Location: Remote
Stipend: 10000/month
"""

async def response_job_parser():
    response = await llm_model.ainvoke()
    content = response.content
    if not content:
        content = "{}"
        
    try:
        data = json.loads(str(content))
        output_dir = os.path.join(project_root, "data")
        os.makedirs(output_dir, exist_ok=True)
        path = os.path.join(output_dir, "jobs.json")
        with open(path, "w") as f:
            json.dump([data], f, indent=4)
        print("Job description parsed and saved successfully ✅")
    except Exception as e:
        print(f"Failed to parse job description: {e}")
        return {"error": "Failed to extract fields", "raw_content": str(content)}

if __name__ == "__main__":
    import asyncio
    asyncio.run(response_job_parser())
