import os

# We are no longer using FAISS or Gemini Embeddings
# This file serves as a no-op shim so imports in other files do not break.

FAISS_BASE_PATH = "data/faiss"

def get_patient_store_path(user_id: str) -> str:
    path = os.path.join(FAISS_BASE_PATH, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path

async def embed_report(user_id: str, report_text: str, report_id: str, summary: str = "", filename: str = "", uploaded_at: str = "") -> None:
    """No-op embed report."""
    pass

async def embed_medication(user_id: str, medication_name: str, dosage: str, frequency: str, medication_id: str) -> None:
    """No-op embed medication."""
    pass

async def load_patient_retriever(user_id: str):
    """Return None to force database fallback in chat_chain.py."""
    return None
