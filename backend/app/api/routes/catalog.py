from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.catalog import ProductQuery
from app.schemas.catalog import CatalogOptionsResponse, ProductListResponse, ProductResponse
from app.services.catalog import get_catalog_options, get_catalog_product, list_catalog_products

router = APIRouter(prefix="/api", tags=["catalog"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/products", response_model=ProductListResponse)
def products(
    db: DatabaseSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 24,
    garment: Annotated[str | None, Query(pattern="^(oversized|raglan)$")] = None,
    theme: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
    color: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
    size: Annotated[str | None, Query(min_length=1, max_length=20)] = None,
    sort: Literal["display", "name-asc", "name-desc"] = "display",
) -> ProductListResponse:
    return list_catalog_products(
        db,
        ProductQuery(
            page=page,
            page_size=page_size,
            garment=garment,
            theme=theme,
            color=color,
            size=size,
            sort=sort,
        ),
    )


@router.get("/products/{slug}", response_model=ProductResponse)
def product(slug: str, db: DatabaseSession) -> ProductResponse:
    return get_catalog_product(db, slug)


@router.get("/catalog/options", response_model=CatalogOptionsResponse)
def catalog_options(db: DatabaseSession) -> CatalogOptionsResponse:
    return get_catalog_options(db)
