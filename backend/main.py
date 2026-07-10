from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, reports, chat, medications, follow_ups, insurance, timeline, dashboard, notifications
from app.scheduler import start_scheduler
from app.middleware.audit_middleware import AuditMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
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

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
