import logging
import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.database import SessionLocal
from app.models.audit import AuditLog
from app.models.user import User
from app.middleware.auth_middleware import verify_token

logger = logging.getLogger(__name__)

SENSITIVE_ROUTES = ["/api/reports", "/api/profile", "/api/medications"]

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Check if the route is sensitive
        is_sensitive = any(request.url.path.startswith(route) for route in SENSITIVE_ROUTES)
        
        if is_sensitive:
            db = SessionLocal()
            try:
                user_id = None
                # Try to extract user from token
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    try:
                        payload = verify_token(token)
                        if payload and "sub" in payload:
                            # user sub is string UUID
                            user_id = payload["sub"]
                    except Exception:
                        pass
                
                # Determine resource type based on route
                resource = "unknown"
                for r in SENSITIVE_ROUTES:
                    if request.url.path.startswith(r):
                        resource = r.strip("/api/")
                        break

                action = f"{request.method} {request.url.path}"
                ip_address = request.client.host if request.client else "unknown"
                user_agent = request.headers.get("user-agent", "unknown")

                audit_log = AuditLog(
                    user_id=user_id,
                    action=action,
                    resource_type=resource,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                db.add(audit_log)
                db.commit()
            except Exception as e:
                logger.error(f"Failed to write audit log: {e}")
            finally:
                db.close()
                
        return response
