import asyncio
import logging
from datetime import datetime, timezone
import pywebpush
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from app.models.medication import Medication
from app.models.user import User
from app.config import settings
from sqlalchemy.orm import joinedload

logger = logging.getLogger(__name__)

async def send_push_notification(subscription: dict, message: str, title: str = "CareFlow AI Alarm"):
    try:
        pywebpush.webpush(
            subscription_info=subscription,
            data=f'{{"title": "{title}", "options": {{"body": "{message}"}}}}',
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": settings.VAPID_SUBJECT}
        )
    except pywebpush.WebPushException as ex:
        if ex.response and ex.response.status_code == 410:
            logger.warning("Subscription expired")
            # Handling expired subscriptions should ideally be done by marking it in DB
        else:
            logger.error(f"Web push failed: {ex}")
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")

async def check_medications():
    """Run every minute to check if any active medications are due."""
    db = SessionLocal()
    try:
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        
        # Query active medications where times_of_day includes current_time_str
        # Join with users to check if they have a push subscription
        meds = db.query(Medication).join(User).filter(
            Medication.is_active == True,
            User.push_subscription.is_not(None)
        ).all()

        for med in meds:
            # times_of_day is stored as a JSON array of strings
            if med.times_of_day and current_time_str in med.times_of_day:
                user = db.query(User).filter(User.id == med.user_id).first()
                if user and user.push_subscription:
                    message = f"Time to take {med.dosage} of {med.name}."
                    logger.info(f"Sending push to user {user.id} for medication {med.name}")
                    await send_push_notification(
                        subscription=user.push_subscription,
                        message=message,
                        title="Medication Reminder"
                    )

    except Exception as e:
        logger.error(f"Error checking medications: {e}")
    finally:
        db.close()

# Initialize the scheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(check_medications, 'cron', minute='*')

def start_scheduler():
    logger.info("Starting Medication APScheduler...")
    scheduler.start()
