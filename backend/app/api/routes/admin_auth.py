from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import AdminSession
from app.schemas.admin import AdminLoginRequest, AdminSessionResponse
from app.services.auth import (
    CSRF_COOKIE,
    SESSION_COOKIE,
    authenticate_admin,
    create_admin_session,
    delete_admin_session,
    get_admin_session,
    require_admin_mutation,
)

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/login", response_model=AdminSessionResponse)
def login(payload: AdminLoginRequest, response: Response, db: DatabaseSession):
    if not authenticate_admin(payload.username, payload.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    try:
        token, csrf, record = create_admin_session(db)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication service is unavailable",
        ) from None
    max_age = settings.admin_session_hours * 3600
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=max_age,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="strict",
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf,
        max_age=max_age,
        httponly=False,
        secure=settings.secure_cookies,
        samesite="strict",
        path="/",
    )
    return AdminSessionResponse(username=settings.admin_username, expiresAt=record.expires_at)


@router.get("/session", response_model=AdminSessionResponse)
def session(record: Annotated[AdminSession, Depends(get_admin_session)]):
    return AdminSessionResponse(username=settings.admin_username, expiresAt=record.expires_at)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    db: DatabaseSession,
    record: Annotated[AdminSession, Depends(require_admin_mutation)],
):
    delete_admin_session(db, record)
    response.delete_cookie(SESSION_COOKIE, path="/")
    response.delete_cookie(CSRF_COOKIE, path="/")
