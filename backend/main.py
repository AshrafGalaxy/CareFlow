from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, reports, chat, medications, follow_ups, insurance, timeline, dashboard, notifications, appointment, order
from app.scheduler import start_scheduler
from app.middleware.audit_middleware import AuditMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import SessionLocal
    from app.models.report import Report
    
    # Clean up any stuck "processing" reports due to previous server restarts
    db = SessionLocal()
    try:
        stuck_reports = db.query(Report).filter(Report.processing_status == "processing").all()
        for report in stuck_reports:
            report.processing_status = "failed"
            report.processing_progress = "Processing interrupted by server restart. Please upload again."
        
        stuck_pending = db.query(Report).filter(Report.processing_status == "pending").all()
        for report in stuck_pending:
            report.processing_status = "failed"
            report.processing_progress = "Processing failed to start. Please upload again."
            
        db.commit()
    except Exception as e:
        print(f"Startup DB cleanup failed: {e}")
    finally:
        db.close()
        
    start_scheduler()
    yield

app = FastAPI(title="CareFlow AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Add audit logging for sensitive routes
app.add_middleware(AuditMiddleware)

# Include all routers with prefixes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(medications.router, prefix="/api/medications", tags=["medications"])
app.include_router(follow_ups.router, prefix="/api/follow-ups", tags=["follow-ups"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["insurance"])
app.include_router(timeline.router, prefix="/api/timeline", tags=["timeline"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(appointment.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(order.router, prefix="/api/orders", tags=["orders"])

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
