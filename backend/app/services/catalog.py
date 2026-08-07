import math

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import GarmentType, PricingRule, Product, ProductImage, ProductVariant, Theme
from app.repositories.catalog import ProductPage, ProductQuery, get_color, get_sizes, get_theme
from app.repositories.catalog import get_product_by_slug as repository_get_product_by_slug
from app.repositories.catalog import list_products as repository_list_products
from app.schemas.catalog import (
    CatalogOptionsResponse,
    GarmentOptionsResponse,
    ImageResponse,
    OptionResponse,
    PriceResponse,
    ProductCreate,
    ProductImagesResponse,
    ProductListResponse,
    ProductResponse,
    ThemeResponse,
    VariantResponse,
)
from app.services.media import media_url_resolver


class CatalogValidationError(ValueError):
    pass


def _prices_for(session: Session, garment_id: int, kind: str) -> dict:
    rules = session.scalars(
        select(PricingRule).where(
            PricingRule.garment_type_id == garment_id,
            PricingRule.product_kind == kind,
        )
    )
    return {
        rule.currency: PriceResponse(minorAmount=rule.amount_minor, currency=rule.currency)
        for rule in rules
    }


def _image_response(image: ProductImage) -> ImageResponse:
    return ImageResponse(
        src=media_url_resolver.resolve(image),
        alt=image.alt_text,
        width=image.width,
        height=image.height,
    )


def serialize_product(session: Session, product: Product) -> ProductResponse:
    primary = next((image for image in product.images if image.role == "primary"), None)
    if primary is None:
        raise RuntimeError(f"Published product {product.id} has no primary image")
    hover = next((image for image in product.images if image.role == "hover"), None)
    gallery = [image for image in product.images if image.role == "gallery"]
    prices = _prices_for(
        session,
        product.garment_type_id,
        "customized" if product.category == "customized" else "standard",
    )
    variants = []
    for variant in sorted(product.variants, key=lambda item: item.size.display_order):
        overrides = {
            item.currency: PriceResponse(minorAmount=item.amount_minor, currency=item.currency)
            for item in variant.prices
        }
        variants.append(
            VariantResponse(
                id=variant.id,
                colorId=product.color.slug,
                sizeId=variant.size.slug,
                availability=variant.availability,
                prices=overrides or None,
            )
        )
    return ProductResponse(
        id=product.id,
        slug=product.slug,
        name=product.name,
        category=product.category,
        garmentType=product.garment_type.slug,
        theme=(
            ThemeResponse(id=product.theme.slug, label=product.theme.name)
            if product.theme
            else None
        ),
        description=product.description,
        images=ProductImagesResponse(
            primary=_image_response(primary),
            hover=_image_response(hover) if hover else None,
            gallery=[_image_response(image) for image in gallery],
        ),
        colors=[
            OptionResponse(
                id=product.color.slug, label=product.color.name, swatch=product.color.swatch
            )
        ],
        sizes=[
            OptionResponse(id=variant.size.slug, label=variant.size.name)
            for variant in sorted(product.variants, key=lambda item: item.size.display_order)
        ],
        prices=prices,
        variants=variants,
        availability=product.availability,
    )


def list_catalog_products(session: Session, query: ProductQuery) -> ProductListResponse:
    page: ProductPage = repository_list_products(session, query)
    return ProductListResponse(
        items=[serialize_product(session, product) for product in page.items],
        page=page.page,
        pageSize=page.page_size,
        total=page.total,
        pages=math.ceil(page.total / page.page_size) if page.total else 0,
    )


def get_catalog_product(session: Session, slug: str) -> ProductResponse:
    product = repository_get_product_by_slug(session, slug)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return serialize_product(session, product)


def get_catalog_options(session: Session) -> CatalogOptionsResponse:
    garments = list(
        session.scalars(
            select(GarmentType)
            .options(selectinload(GarmentType.colors), selectinload(GarmentType.sizes))
            .order_by(GarmentType.id)
        )
    )
    themes = list(session.scalars(select(Theme).order_by(Theme.id)))
    return CatalogOptionsResponse(
        themes=[ThemeResponse(id=theme.slug, label=theme.name) for theme in themes],
        garments=[
            GarmentOptionsResponse(
                id=garment.slug,
                label=garment.name,
                colors=[
                    OptionResponse(id=color.slug, label=color.name, swatch=color.swatch)
                    for color in garment.colors
                ],
                sizes=[OptionResponse(id=size.slug, label=size.name) for size in garment.sizes],
                standardPrices=_prices_for(session, garment.id, "standard"),
                customizedPrices=_prices_for(session, garment.id, "customized"),
            )
            for garment in garments
        ],
    )


def create_product(session: Session, payload: ProductCreate) -> Product:
    """Internal mutation foundation. It is intentionally not exposed by public routes."""
    garment = session.scalar(
        select(GarmentType)
        .where(GarmentType.slug == payload.garment_slug)
        .options(selectinload(GarmentType.colors), selectinload(GarmentType.sizes))
    )
    if garment is None:
        raise CatalogValidationError("Unknown garment type")
    if payload.category != "customized" and payload.category != garment.slug:
        raise CatalogValidationError("Standard product category must match its garment type")
    if payload.category == "customized" and payload.theme_slug:
        raise CatalogValidationError("Customized products cannot use predefined themes")
    if payload.category != "customized" and not payload.theme_slug:
        raise CatalogValidationError("Standard products require a theme")

    theme = get_theme(session, payload.theme_slug) if payload.theme_slug else None
    if payload.theme_slug and theme is None:
        raise CatalogValidationError("Unknown theme")
    color = get_color(session, payload.color_slug)
    if color is None or color.id not in {item.id for item in garment.colors}:
        raise CatalogValidationError("Color is not available for this garment")

    requested_sizes = set(payload.size_slugs)
    sizes = get_sizes(session, requested_sizes)
    allowed_size_ids = {item.id for item in garment.sizes}
    if len(sizes) != len(requested_sizes) or any(size.id not in allowed_size_ids for size in sizes):
        raise CatalogValidationError("Size is not available for this garment")
    if session.scalar(select(Product.id).where(Product.slug == payload.slug)):
        raise CatalogValidationError("Product slug already exists")
    if sum(image.role == "primary" for image in payload.images) != 1:
        raise CatalogValidationError("A product requires exactly one primary image")
    if len({image.position for image in payload.images}) != len(payload.images):
        raise CatalogValidationError("Image positions must be unique")
    if any(not image.storage_key and not image.public_url for image in payload.images):
        raise CatalogValidationError("Every image requires a storage reference")

    product = Product(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        category=payload.category,
        garment_type=garment,
        theme=theme,
        color=color,
        availability=payload.availability,
        display_order=payload.display_order,
    )
    product.variants = [
        ProductVariant(size=size, availability=payload.availability)
        for size in sorted(sizes, key=lambda item: item.display_order)
    ]
    product.images = [
        ProductImage(
            storage_key=image.storage_key,
            public_url=str(image.public_url) if image.public_url else None,
            alt_text=image.alt_text,
            width=image.width,
            height=image.height,
            position=image.position,
            role=image.role,
        )
        for image in payload.images
    ]
    session.add(product)
    session.flush()
    return product
