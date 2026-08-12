import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

def test_groq_connection():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    path_env = os.path.join(project_root, "config", ".env")
    load_dotenv(path_env)

    try:
        llm_model = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
        res = llm_model.invoke("hi")
        print("Groq test response:", res.content)
        return True
    except Exception as e:
        print("Groq connection test failed:", e)
        return False

if __name__ == "__main__":
    test_groq_connection()