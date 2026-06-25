from datetime import date


async def add_timeline_event(
    db,
    user_id: str,
    event_type: str,  # "report", "medication", "followup", "insurance_query"
    event_date: date,
    title: str,
    description: str = "",
    reference_id: str = None,
    reference_table: str = None
) -> None:
    """
    Auto-create a health timeline event. Call this whenever a key patient action happens.
    Used by: report processing, medication creation, follow-up creation, insurance queries.
    """
    from app.models.timeline import HealthTimelineEvent
    event = HealthTimelineEvent(
        user_id=user_id,
        event_type=event_type,
        event_date=event_date,
        title=title,
        description=description,
        reference_id=reference_id,
        reference_table=reference_table
    )
    db.add(event)
    db.commit()
