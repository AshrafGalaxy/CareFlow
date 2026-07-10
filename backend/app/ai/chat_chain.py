from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from app.ai.prompts import CHAT_SYSTEM_PROMPT
from app.ai.vector_store import load_patient_retriever
from typing import AsyncGenerator
import os


async def get_streaming_response(
    message: str,
    session_id: str,
    user_id: str,
    chat_history: list[dict],  # [{"role": "user"|"assistant", "content": str}]
    image_base64: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Yields response tokens one by one for Server-Sent Events streaming.
    """
    # Try to load FAISS retriever, but catch API key errors gracefully
    retriever = None
    try:
        retriever = await load_patient_retriever(user_id)
    except Exception as e:
        print(f"FAISS retriever failed to load (likely missing API keys): {e}")

    # Use Groq exclusively
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        raise ValueError("GROQ_API_KEY is missing. Chat cannot function.")
        
    model_name = "llama-3.2-90b-vision-preview" if image_base64 else "llama-3.3-70b-versatile"
    llm = ChatGroq(
        model=model_name,
        api_key=groq_api_key,
        temperature=0.3,
        max_retries=1
    )
    # Format chat history for LangChain
    history_messages = []
    for msg in chat_history[-10:]:
        role = "ai" if msg["role"] == "assistant" else "human"
        history_messages.append((role, msg["content"]))

    # Prepare current user message
    if image_base64:
        # Ensure it has the data URI prefix for base64 if it doesn't already
        img_url = image_base64 if image_base64.startswith("data:image") else f"data:image/jpeg;base64,{image_base64}"
        human_content = [
            {"type": "text", "text": message},
            {"type": "image_url", "image_url": {"url": img_url}}
        ]
        current_msg = ("human", human_content)
    else:
        current_msg = ("human", message)

    if retriever:
        try:
            # Retrieve relevant patient context
            docs = await retriever.ainvoke(message)
            context = "\n\n".join([doc.page_content for doc in docs])
        except Exception as e:
            print(f"FAISS search failed: {e}")
            retriever = None  # Fallback to DB

    if not retriever:
        # PURE DATABASE FALLBACK: If FAISS is missing (e.g., no embeddings API key)
        # We manually fetch the last 3 reports from Postgres to provide context!
        from app.database import SessionLocal
        from app.models.report import Report
        db = SessionLocal()
        try:
            recent_reports = db.query(Report).filter(Report.user_id == user_id).order_by(Report.uploaded_at.desc()).limit(3).all()
            if recent_reports:
                context = "Patient's recent medical reports:\n\n"
                for r in recent_reports:
                    context += f"--- REPORT ({r.uploaded_at}) ---\nSummary: {r.ai_summary}\nHighlights: {r.ai_highlights}\nAbnormal Values: {r.abnormal_values}\nRaw Text: {r.ocr_text[:1000]}...\n\n"
            else:
                context = "No patient records uploaded yet."
        except Exception as e:
            print(f"DB Fallback failed: {e}")
            context = "No patient records uploaded yet."
        finally:
            db.close()
        
    messages = [
        ("system", CHAT_SYSTEM_PROMPT.format(context=context)),
        *history_messages,
        current_msg
    ]
        
    async for chunk in llm.astream(messages):
        if chunk.content:
            yield chunk.content

async def generate_chat_title(message: str) -> str:
    """Generate a concise 3-5 word title for the chat session based on the first message."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        return "New Chat" # Fallback title if API key is missing
        
    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=groq_api_key, temperature=0.3, max_retries=1)
    
    prompt = f"Create a concise 3 to 5 word title for a healthcare chat that starts with this message. Output ONLY the title, no quotes or extra text.\nMessage: '{message}'"
    
    try:
        response = await llm.ainvoke(prompt)
        # Clean up any surrounding quotes if the LLM adds them
        return response.content.strip().strip('"').strip("'")
    except Exception:
        # Fallback to simple slicing if LLM fails
        return message[:40] + ("..." if len(message) > 40 else "")
