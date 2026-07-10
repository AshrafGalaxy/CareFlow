from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatSessionResponse, 
    MessageRequest, 
    ChatMessageResponse,
    ChatFeedbackRequest,
    ChatFeedbackResponse
)
from app.middleware.auth_middleware import get_current_user
from app.ai.chat_chain import get_streaming_response, generate_chat_title

router = APIRouter()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session."""
    session = ChatSession(user_id=user.id, title="New Conversation")
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=list[ChatSessionResponse])
async def get_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all chat sessions for the user."""
    return db.query(ChatSession).filter(
        ChatSession.user_id == user.id
    ).order_by(ChatSession.created_at.desc()).all()


import base64
import os
import uuid as uuid_lib

def save_chat_image(base64_str: str) -> str | None:
    if not base64_str:
        return None
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        img_data = base64.b64decode(base64_str)
        filename = f"{uuid_lib.uuid4().hex}.jpg"
        
        # Path to frontend public folder
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "frontend", "public", "uploads", "chat_images")
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(img_data)
            
        return f"/uploads/chat_images/{filename}"
    except Exception as e:
        print(f"Failed to save image: {e}")
        return None

@router.post("/{session_id}/message")
async def send_message(
    session_id: str,
    body: MessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message and stream the AI response via SSE.
    """
    import uuid as uuid_lib
    # Verify session ownership
    session = db.query(ChatSession).filter(
        ChatSession.id == uuid_lib.UUID(session_id),
        ChatSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    image_url = save_chat_image(body.image_base64) if getattr(body, "image_base64", None) else None

    # Save user message
    user_msg = ChatMessage(
        session_id=uuid_lib.UUID(session_id),
        role="user",
        content=body.content,
        image_url=image_url
    )
    db.add(user_msg)
    db.commit()

    # Load chat history (excluding current message)
    history = db.query(ChatMessage).filter(
        ChatMessage.session_id == uuid_lib.UUID(session_id)
    ).order_by(ChatMessage.timestamp.asc()).all()
    history_dicts = [
        {"role": m.role, "content": m.content}
        for m in history[:-1]  # exclude the message we just saved
    ]

    # Extract strings from SQLAlchemy objects before the session closes
    user_id_str = str(user.id)

    async def generate():
        full_response = ""
        try:
            async for token in get_streaming_response(
                body.content, session_id, user_id_str, history_dicts
            ):
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

        # Save assistant response to DB using a new session since the dependency one is closed
        new_title = None
        if full_response.strip():
            from app.database import SessionLocal
            import uuid as uuid_lib2
            
            local_db = SessionLocal()
            try:
                metadata_json = None
                if "[[WIDGET:HOSPITAL]]" in full_response:
                    metadata_json = {"widget_type": "hospital"}
                elif "[[WIDGET:EMERGENCY]]" in full_response:
                    metadata_json = {"widget_type": "emergency"}
                elif "[[WIDGET:SCHEDULE]]" in full_response:
                    metadata_json = {"widget_type": "schedule"}
                elif "[[WIDGET:MEDICATION]]" in full_response:
                    metadata_json = {"widget_type": "medication"}

                ai_msg = ChatMessage(
                    session_id=uuid_lib2.UUID(session_id),
                    role="assistant",
                    content=full_response,
                    metadata_json=metadata_json
                )
                local_db.add(ai_msg)
                
                # Update session title from first user message if it's still "New Conversation"
                local_session = local_db.query(ChatSession).filter(ChatSession.id == uuid_lib2.UUID(session_id)).first()
                if local_session and local_session.title == "New Conversation" and body.content:
                    local_session.title = await generate_chat_title(body.content)
                    new_title = local_session.title
                    
                local_db.commit()
            finally:
                local_db.close()

        if new_title:
            yield f"data: {json.dumps({'title': new_title})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a session."""
    import uuid as uuid_lib
    # Verify ownership first
    session = db.query(ChatSession).filter(
        ChatSession.id == uuid_lib.UUID(session_id),
        ChatSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return db.query(ChatMessage).filter(
        ChatMessage.session_id == uuid_lib.UUID(session_id)
    ).order_by(ChatMessage.timestamp.asc()).all()


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat session."""
    import uuid as uuid_lib
    
    session = db.query(ChatSession).filter(
        ChatSession.id == uuid_lib.UUID(session_id),
        ChatSession.user_id == user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    
    return {"status": "success", "message": "Session deleted successfully"}


@router.post("/messages/{message_id}/feedback", response_model=ChatFeedbackResponse)
async def submit_feedback(
    message_id: str,
    feedback: ChatFeedbackRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit RLHF feedback for an AI message."""
    import uuid as uuid_lib
    from app.models.chat import ChatFeedback
    
    # Verify the message exists and belongs to the user
    message = db.query(ChatMessage).join(ChatSession).filter(
        ChatMessage.id == uuid_lib.UUID(message_id),
        ChatSession.user_id == user.id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    if message.role != "assistant":
        raise HTTPException(status_code=400, detail="Can only provide feedback for AI messages")
        
    # Check if feedback already exists
    existing = db.query(ChatFeedback).filter(
        ChatFeedback.message_id == message.id,
        ChatFeedback.user_id == user.id
    ).first()
    
    if existing:
        # Update existing feedback
        existing.is_positive = 1 if feedback.is_positive else 0
        existing.feedback_text = feedback.feedback_text
        db.commit()
        db.refresh(existing)
        return existing
        
    # Create new feedback
    new_feedback = ChatFeedback(
        message_id=message.id,
        user_id=user.id,
        is_positive=1 if feedback.is_positive else 0,
        feedback_text=feedback.feedback_text
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback
