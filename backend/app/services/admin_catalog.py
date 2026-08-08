from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import Product, ProductVariant
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminProductListResponse,
    ProductUpdate,
)
from app.schemas.catalog import ProductCreate, ProductResponse
from app.services.catalog import (
    CatalogValidationError,
    build_product_images,
    create_product,
    resolve_product_configuration,
    serialize_product,
)


def _load_product(session: Session, product_id: str) -> Product:
    product = session.scalar(
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants).selectinload(ProductVariant.prices),
        )
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def admin_list_products(
    session: Session,
    search: str | None = None,
    garment: str | None = None,
    include_archived: bool = False,
) -> AdminProductListResponse:
    statement = select(Product).options(
        selectinload(Product.images),
        selectinload(Product.variants).selectinload(ProductVariant.prices),
    )
    if not include_archived:
        statement = statement.where(Product.archived_at.is_(None))
    if search:
        value = f"%{search.strip()}%"
        statement = statement.where(or_(Product.name.ilike(value), Product.slug.ilike(value)))
    if garment:
        statement = statement.where(Product.garment_type.has(slug=garment))
    products = list(session.scalars(statement.order_by(Product.created_at.desc())).unique())
    return AdminProductListResponse(
        items=[serialize_product(session, product) for product in products], total=len(products)
    )


def admin_get_product(session: Session, product_id: str) -> ProductResponse:
    return serialize_product(session, _load_product(session, product_id))


def admin_create_product(session: Session, payload: ProductCreate) -> ProductResponse:
    try:
        product = create_product(session, payload)
        session.commit()
        session.refresh(product)
        return serialize_product(session, _load_product(session, product.id))
    except CatalogValidationError:
        session.rollback()
        raise


def admin_update_product(
    session: Session, product_id: str, payload: ProductUpdate
) -> ProductResponse:
    product = _load_product(session, product_id)
    try:
        create_payload = ProductCreate.model_validate(payload.model_dump())
        garment, theme, color, sizes = resolve_product_configuration(
            session, create_payload, current_product_id=product_id
        )
        product.name = payload.name
        product.slug = payload.slug
        product.description = payload.description
        product.category = payload.category
        product.garment_type = garment
        product.theme = theme
        product.color = color
        product.availability = payload.availability
        product.display_order = payload.display_order
        product.archived_at = None

        variants_by_size = {variant.size_id: variant for variant in product.variants}
        product.variants = [
            variants_by_size.get(size.id)
            or ProductVariant(size=size, availability=payload.availability)
            for size in sizes
        ]
        for variant in product.variants:
            variant.availability = payload.availability
        product.images = []
        session.flush()
        product.images = build_product_images(session, create_payload)
        session.commit()
        return serialize_product(session, _load_product(session, product_id))
    except CatalogValidationError:
        session.rollback()
        raise


def archive_product(session: Session, product_id: str) -> None:
    product = _load_product(session, product_id)
    product.archived_at = datetime.now(UTC).replace(tzinfo=None)
    product.availability = "unavailable"
    for variant in product.variants:
        variant.availability = "unavailable"
    session.commit()


def dashboard(session: Session) -> AdminDashboardResponse:
    active = Product.archived_at.is_(None)

    def count(*criteria) -> int:
        return session.scalar(select(func.count()).select_from(Product).where(*criteria)) or 0

    recent = list(
        session.scalars(
            select(Product)
            .where(active)
            .options(
                selectinload(Product.images),
                selectinload(Product.variants).selectinload(ProductVariant.prices),
            )
            .order_by(Product.created_at.desc())
            .limit(5)
        ).unique()
    )
    return AdminDashboardResponse(
        totalProducts=count(active),
        availableProducts=count(active, Product.availability == "available"),
        unavailableProducts=count(active, Product.availability == "unavailable"),
        archivedProducts=count(Product.archived_at.is_not(None)),
        oversizedProducts=count(active, Product.category == "oversized"),
        raglanProducts=count(active, Product.category == "raglan"),
        customizedProducts=count(active, Product.category == "customized"),
        recentProducts=[serialize_product(session, product) for product in recent],
    )
