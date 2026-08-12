import io
import fitz  
from typing import Union

def extract_resume_text(resume_input: Union[str, bytes]) -> str:
    """
    Extract text from a PDF file path, raw bytes, or text string using PyMuPDF (fitz).
    """
    if isinstance(resume_input, bytes):
        try:
            doc = fitz.open(stream=resume_input, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
            if text.strip():
                return text.strip()
        except Exception:
            try:
                return resume_input.decode("utf-8").strip()
            except Exception:
                return ""
    elif isinstance(resume_input, str):
        if resume_input.lower().endswith(".pdf"):
            try:
                doc = fitz.open(resume_input)
                text = ""
                for page in doc:
                    text += page.get_text() + "\n"
                if text.strip():
                    return text.strip()
            except Exception:
                pass
        return resume_input.strip()
    return ""
