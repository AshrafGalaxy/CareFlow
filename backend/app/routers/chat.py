from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionResponse, MessageRequest, ChatMessageResponse
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


@router.post("/{session_id}/message")
async def send_message(
    session_id: str,
    body: MessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message and stream the AI response via SSE.
    Response format: text/event-stream
    Each event: data: {"token": "..."}\n\n
    Final event: data: [DONE]\n\n
    """
    import uuid as uuid_lib
    # Verify session ownership
    session = db.query(ChatSession).filter(
        ChatSession.id == uuid_lib.UUID(session_id),
        ChatSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    user_msg = ChatMessage(
        session_id=uuid_lib.UUID(session_id),
        role="user",
        content=body.content
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
        if full_response.strip():
            from app.database import SessionLocal
            import uuid as uuid_lib2
            
            local_db = SessionLocal()
            try:
                ai_msg = ChatMessage(
                    session_id=uuid_lib2.UUID(session_id),
                    role="assistant",
                    content=full_response
                )
                local_db.add(ai_msg)
                
                # Update session title from first user message if it's still "New Conversation"
                local_session = local_db.query(ChatSession).filter(ChatSession.id == uuid_lib2.UUID(session_id)).first()
                if local_session and local_session.title == "New Conversation" and body.content:
                    local_session.title = await generate_chat_title(body.content)
                    
                local_db.commit()
            finally:
                local_db.close()

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
