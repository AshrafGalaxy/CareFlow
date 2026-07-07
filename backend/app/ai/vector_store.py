import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

FAISS_BASE_PATH = "data/faiss"


def get_patient_store_path(user_id: str) -> str:
    path = os.path.join(FAISS_BASE_PATH, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path


async def embed_report(user_id: str, report_text: str, report_id: str, summary: str = "", filename: str = "", uploaded_at: str = "") -> None:
    """
    Embed a processed report into the patient's personal FAISS index.
    Call this AFTER OCR + AI analysis is complete.
    """
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    store_path = get_patient_store_path(user_id)

    # Create rich document with both raw text and summary
    content = f"REPORT DATE: {uploaded_at}\nFILENAME: {filename}\nREPORT ID: {report_id}\nSUMMARY: {summary}\nFULL TEXT: {report_text[:3000]}"
    doc = Document(
        page_content=content,
        metadata={"source": "report", "report_id": report_id, "user_id": user_id}
    )

    index_file = os.path.join(store_path, "index.faiss")
    if os.path.exists(index_file):
        store = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
        store.add_documents([doc])
    else:
        store = FAISS.from_documents([doc], embeddings)

    store.save_local(store_path)


async def embed_medication(user_id: str, medication_name: str, dosage: str, frequency: str, medication_id: str) -> None:
    """Embed medication info so chat can reference it."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    store_path = get_patient_store_path(user_id)

    content = f"MEDICATION: {medication_name}, DOSAGE: {dosage}, FREQUENCY: {frequency}, ID: {medication_id}"
    doc = Document(
        page_content=content,
        metadata={"source": "medication", "medication_id": medication_id}
    )

    index_file = os.path.join(store_path, "index.faiss")
    if os.path.exists(index_file):
        store = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
        store.add_documents([doc])
    else:
        store = FAISS.from_documents([doc], embeddings)

    store.save_local(store_path)


async def load_patient_retriever(user_id: str):
    """Load patient's FAISS store and return a retriever. Returns None if no store exists."""
    store_path = get_patient_store_path(user_id)
    index_file = os.path.join(store_path, "index.faiss")

    if not os.path.exists(index_file):
        return None

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    store = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
    return store.as_retriever(search_kwargs={"k": 4})
