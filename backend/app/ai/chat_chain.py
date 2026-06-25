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
    chat_history: list[dict]  # [{"role": "user"|"assistant", "content": str}]
) -> AsyncGenerator[str, None]:
    """
    Yields response tokens one by one for Server-Sent Events streaming.
    """
    # Load patient's retriever (their reports + medication context)
    retriever = await load_patient_retriever(user_id)

    # Use Groq if available, otherwise fallback to Gemini
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key and groq_api_key.strip() != "":
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=groq_api_key,
            temperature=0.3,
            max_retries=1
        )
    else:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite", 
            streaming=True, 
            temperature=0.3,
            max_retries=1 # Fail fast instead of hanging
        )
    
    # Format chat history for LangChain
    history_messages = []
    for msg in chat_history[-10:]:
        role = "ai" if msg["role"] == "assistant" else "human"
        history_messages.append((role, msg["content"]))

    if retriever:
        # Retrieve relevant patient context
        docs = await retriever.ainvoke(message)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        messages = [
            ("system", f"{CHAT_SYSTEM_PROMPT}\n\nRelevant Patient Context:\n{context}"),
            *history_messages,
            ("human", message)
        ]
    else:
        # No patient data yet — direct chat with system prompt
        messages = [
            ("system", "You are CareFlow AI, a healthcare companion. Help the patient. Never diagnose. Always suggest consulting a doctor."),
            *history_messages,
            ("human", message)
        ]
        
    async for chunk in llm.astream(messages):
        if chunk.content:
            yield chunk.content
