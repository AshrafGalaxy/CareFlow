from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.middleware.auth_middleware import get_current_user
from pydantic import BaseModel
import pywebpush
from app.config import settings

router = APIRouter()

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict

@router.post("/subscribe")
def subscribe(
    subscription: PushSubscription,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.push_subscription = subscription.dict()
    db.commit()
    return {"message": "Subscribed successfully"}

@router.post("/test")
def test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.push_subscription:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No push subscription found")
    
    try:
        pywebpush.webpush(
            subscription_info=current_user.push_subscription,
            data="Hello from CareFlow AI! Your medication alarm test was successful.",
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_SUBJECT}
        )
        return {"message": "Notification sent successfully"}
    except pywebpush.WebPushException as ex:
        if ex.response and ex.response.status_code == 410:
            current_user.push_subscription = None
            db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subscription expired")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Web push failed: {str(ex)}")
