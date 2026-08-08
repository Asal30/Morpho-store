from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import AdminSession
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminProductListResponse,
    MediaAssetResponse,
    MediaListResponse,
    ProductUpdate,
)
from app.schemas.catalog import ProductCreate, ProductResponse
from app.services.admin_catalog import (
    admin_create_product,
    admin_get_product,
    admin_list_products,
    admin_update_product,
    archive_product,
    dashboard,
)
from app.services.auth import get_admin_session, require_admin_mutation
from app.services.catalog import CatalogValidationError
from app.services.media import delete_media, list_media, upload_media

router = APIRouter(prefix="/api/admin", tags=["admin"])
DatabaseSession = Annotated[Session, Depends(get_db)]
Authenticated = Annotated[AdminSession, Depends(get_admin_session)]
MutationAuthorized = Annotated[AdminSession, Depends(require_admin_mutation)]


def validation_error(error: CatalogValidationError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(error))


@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(db: DatabaseSession, _: Authenticated) -> AdminDashboardResponse:
    return dashboard(db)


@router.get("/products", response_model=AdminProductListResponse)
def products(
    db: DatabaseSession,
    _: Authenticated,
    search: str | None = None,
    garment: str | None = Query(default=None, pattern="^(oversized|raglan)$"),
    include_archived: bool = Query(default=False, alias="includeArchived"),
) -> AdminProductListResponse:
    return admin_list_products(db, search, garment, include_archived)


@router.get("/products/{product_id}", response_model=ProductResponse)
def product(product_id: str, db: DatabaseSession, _: Authenticated) -> ProductResponse:
    return admin_get_product(db, product_id)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create(payload: ProductCreate, db: DatabaseSession, _: MutationAuthorized) -> ProductResponse:
    try:
        return admin_create_product(db, payload)
    except CatalogValidationError as error:
        raise validation_error(error) from error


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update(
    product_id: str,
    payload: ProductUpdate,
    db: DatabaseSession,
    _: MutationAuthorized,
) -> ProductResponse:
    try:
        return admin_update_product(db, product_id, payload)
    except CatalogValidationError as error:
        raise validation_error(error) from error


@router.post("/products/{product_id}/archive", status_code=status.HTTP_204_NO_CONTENT)
def archive(product_id: str, db: DatabaseSession, _: MutationAuthorized) -> Response:
    archive_product(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/media", response_model=MediaListResponse)
def media(
    db: DatabaseSession,
    _: Authenticated,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=48, alias="pageSize", ge=1, le=100),
) -> MediaListResponse:
    return list_media(db, page, page_size)


@router.post("/media", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED)
async def upload(
    file: UploadFile, db: DatabaseSession, _: MutationAuthorized
) -> MediaAssetResponse:
    return await upload_media(db, file)


@router.delete("/media/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_media(asset_id: str, db: DatabaseSession, _: MutationAuthorized) -> Response:
    delete_media(db, asset_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
