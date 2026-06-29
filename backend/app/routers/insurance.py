from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.insurance import InsuranceQuery
from app.schemas.insurance import InsuranceQueryCreate, InsuranceQueryResponse, InsuranceQuerySummary
from app.middleware.auth_middleware import get_current_user
from app.middleware.rbac import require_role
from app.ai.insurance_chain import navigate_insurance
from app.utils.timeline_builder import add_timeline_event

router = APIRouter()


@router.post("/navigate", response_model=InsuranceQueryResponse)
async def navigate(
    body: InsuranceQueryCreate,
    user: User = Depends(require_role("patient")),
    db: Session = Depends(get_db)
):
    if not body.query or not body.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query cannot be empty")

    state = body.state or "Maharashtra"

    try:
        result = await navigate_insurance(body.query, state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insurance Navigator failed: {e}"
        )

    record = InsuranceQuery(
        id=uuid.uuid4(),
        user_id=user.id,
        query_text=body.query,
        procedure_extracted=result.get("procedure_extracted"),
        schemes_suggested=result.get("schemes_suggested"),
        cost_estimate=result.get("cost_estimate"),
        documents_checklist=result.get("documents_checklist"),
        cashless_guidance=result.get("cashless_guidance"),
        questions_to_ask=result.get("questions_to_ask"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        await add_timeline_event(
            db=db,
            user_id=str(user.id),
            event_type="insurance_query",
            event_date=date.today(),
            title=f"Insurance Query: {result.get('procedure_extracted', body.query)}",
            description=f"Searched coverage options for {result.get('procedure_extracted', body.query)}",
            reference_id=str(record.id),
            reference_table="insurance_queries"
        )
    except Exception as e:
        print(f"Timeline event failed for insurance query {record.id}: {e}")

    return record


@router.get("/queries", response_model=list[InsuranceQuerySummary])
def list_queries(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(InsuranceQuery).filter(
        InsuranceQuery.user_id == user.id
    ).order_by(InsuranceQuery.created_at.desc()).all()


@router.get("/queries/{id}", response_model=InsuranceQueryResponse)
def get_query(
    id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(InsuranceQuery).filter(
        InsuranceQuery.id == id, InsuranceQuery.user_id == user.id
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance query not found")
    return record