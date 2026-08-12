import asyncio
from langchain.chat_models import init_chat_model
import os
from dotenv import load_dotenv
load_dotenv("config/.env")
async def main():
    try:
        llm = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq")
        res = await llm.ainvoke("Return a valid JSON object with key 'hello' and value 'world'.")
        print("Response from Groq Llama 3.3:", repr(res.content))
    except Exception as e:
        print("Error with Groq:", e)
    try:
        llm2 = init_chat_model(model="gemini-2.5-flash", model_provider="google_genai")
        res2 = await llm2.ainvoke("Return a valid JSON object with key 'hello' and value 'world'.")
        print("Response from Gemini 2.5 Flash:", repr(res2.content))
    except Exception as e:
        print("Error with Gemini:", e)
asyncio.run(main())
