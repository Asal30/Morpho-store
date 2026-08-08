import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from pwdlib import PasswordHash
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import AdminSession

SESSION_COOKIE = "morpho_admin_session"
CSRF_COOKIE = "morpho_admin_csrf"
password_hash = PasswordHash.recommended()


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def authenticate_admin(username: str, password: str) -> bool:
    if not settings.admin_password_hash:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin credentials are not configured",
        )
    username_valid = hmac.compare_digest(username, settings.admin_username)
    try:
        password_valid = password_hash.verify(password, settings.admin_password_hash)
    except Exception:
        password_valid = False
    return username_valid and password_valid


def create_admin_session(session: Session) -> tuple[str, str, AdminSession]:
    token = secrets.token_urlsafe(48)
    csrf = secrets.token_urlsafe(32)
    now = datetime.now(UTC).replace(tzinfo=None)
    record = AdminSession(
        token_hash=digest(token),
        csrf_hash=digest(csrf),
        expires_at=now + timedelta(hours=settings.admin_session_hours),
    )
    session.add(record)
    session.commit()
    return token, csrf, record


def get_admin_session(request: Request, db: Annotated[Session, Depends(get_db)]) -> AdminSession:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )
    record = db.scalar(select(AdminSession).where(AdminSession.token_hash == digest(token)))
    now = datetime.now(UTC).replace(tzinfo=None)
    if record is None or record.expires_at <= now:
        if record:
            db.delete(record)
            db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    return record


def require_admin_mutation(
    request: Request,
    record: Annotated[AdminSession, Depends(get_admin_session)],
) -> AdminSession:
    origin = request.headers.get("origin")
    expected_origin = str(settings.frontend_url).rstrip("/")
    if origin and origin.rstrip("/") != expected_origin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid request origin")
    csrf_cookie = request.cookies.get(CSRF_COOKIE)
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or not hmac.compare_digest(csrf_cookie, csrf_header):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
    if not hmac.compare_digest(digest(csrf_header), record.csrf_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
    return record


def delete_admin_session(session: Session, record: AdminSession) -> None:
    session.execute(delete(AdminSession).where(AdminSession.id == record.id))
    session.commit()


def generate_password_hash(password: str) -> str:
    return password_hash.hash(password)


if __name__ == "__main__":
    import getpass

    print(generate_password_hash(getpass.getpass("Admin password: ")))
