from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.timeline import HealthTimelineEvent, HealthTimelineSummary
from app.schemas.timeline import TimelineListResponse, TimelineEventResponse, TimelineSummaryResponse
from app.middleware.auth_middleware import get_current_user
from app.ai.prompts import TIMELINE_SUMMARY_PROMPT

router = APIRouter()


@router.get("/", response_model=TimelineListResponse)
def get_timeline(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get health timeline events, sorted by date descending."""
    total = db.query(HealthTimelineEvent).filter(
        HealthTimelineEvent.user_id == user.id
    ).count()

    events = db.query(HealthTimelineEvent).filter(
        HealthTimelineEvent.user_id == user.id
    ).order_by(
        HealthTimelineEvent.event_date.desc(),
        HealthTimelineEvent.created_at.desc()
    ).offset(offset).limit(limit).all()

    return TimelineListResponse(events=events, total=total)


@router.get("/summary", response_model=TimelineSummaryResponse)
async def get_timeline_summary(
    force_refresh: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an AI summary of the patient's health journey with smart caching."""
    import os
    from langchain_core.messages import HumanMessage

    events = db.query(HealthTimelineEvent).filter(
        HealthTimelineEvent.user_id == user.id
    ).order_by(HealthTimelineEvent.event_date.asc()).limit(50).all()

    current_event_count = len(events)

    if current_event_count == 0:
        return TimelineSummaryResponse(
            summary="No health events recorded yet. Start by uploading a medical report or adding a medication to track your health journey.",
            last_updated=None
        )

    # Check for existing cached summary
    cached_summary = db.query(HealthTimelineSummary).filter(
        HealthTimelineSummary.user_id == user.id
    ).first()

    if not force_refresh and cached_summary and cached_summary.event_count == current_event_count:
        return TimelineSummaryResponse(
            summary=cached_summary.summary_text,
            last_updated=cached_summary.last_updated
        )

    # Format events as text for the LLM
    events_text = "\n".join([
        f"- [{e.event_date}] {e.event_type.upper()}: {e.title} — {e.description or 'No description'}"
        for e in events
    ])

    prompt = TIMELINE_SUMMARY_PROMPT.format(events=events_text)

    try:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key and groq_api_key.strip():
            from langchain_groq import ChatGroq
            llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=groq_api_key, temperature=0.3, max_retries=1)
        else:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.3, max_retries=1)
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        summary_text = response.content.strip()
    except Exception:
        if cached_summary and cached_summary.summary_text:
            summary_text = cached_summary.summary_text
        else:
            summary_text = f"Your health journey includes {current_event_count} events. Keep up the great work tracking your health!"

    # Save to database
    if not cached_summary:
        cached_summary = HealthTimelineSummary(
            user_id=user.id,
            summary_text=summary_text,
            event_count=current_event_count
        )
        db.add(cached_summary)
    else:
        cached_summary.summary_text = summary_text
        cached_summary.event_count = current_event_count
    
    db.commit()
    db.refresh(cached_summary)

    return TimelineSummaryResponse(
        summary=cached_summary.summary_text,
        last_updated=cached_summary.last_updated
    )
