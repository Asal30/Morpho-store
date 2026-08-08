from dataclasses import dataclass
from typing import Literal

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Color, Product, ProductVariant, Size, Theme

SortOption = Literal["display", "name-asc", "name-desc"]


@dataclass(frozen=True)
class ProductQuery:
    page: int = 1
    page_size: int = 24
    garment: str | None = None
    theme: str | None = None
    color: str | None = None
    size: str | None = None
    sort: SortOption = "display"


@dataclass(frozen=True)
class ProductPage:
    items: list[Product]
    total: int
    page: int
    page_size: int


def _product_load_options():
    return (
        selectinload(Product.images),
        selectinload(Product.variants).selectinload(ProductVariant.prices),
    )


def list_products(session: Session, query: ProductQuery) -> ProductPage:
    statement: Select[tuple[Product]] = select(Product)
    count_statement = select(func.count(func.distinct(Product.id))).select_from(Product)

    filters = []
    if query.garment:
        filters.append(Product.garment_type.has(slug=query.garment))
    if query.theme:
        filters.append(Product.theme.has(slug=query.theme))
    if query.color:
        filters.append(Product.color.has(slug=query.color))
    if query.size:
        filters.append(Product.variants.any(ProductVariant.size.has(slug=query.size)))

    statement = statement.where(Product.archived_at.is_(None), *filters)
    count_statement = count_statement.where(Product.archived_at.is_(None), *filters)

    if query.sort == "name-asc":
        statement = statement.order_by(Product.name.asc(), Product.id.asc())
    elif query.sort == "name-desc":
        statement = statement.order_by(Product.name.desc(), Product.id.asc())
    else:
        # Shared-rule price sorting is added only when explicit product pricing exists.
        statement = statement.order_by(
            Product.display_order.asc(), Product.created_at.desc(), Product.id.asc()
        )

    total = session.scalar(count_statement) or 0
    items = list(
        session.scalars(
            statement.options(*_product_load_options())
            .offset((query.page - 1) * query.page_size)
            .limit(query.page_size)
        ).unique()
    )
    return ProductPage(items=items, total=total, page=query.page, page_size=query.page_size)


def get_product_by_slug(session: Session, slug: str) -> Product | None:
    return session.scalar(
        select(Product)
        .where(Product.slug == slug, Product.archived_at.is_(None))
        .options(*_product_load_options())
    )


def get_theme(session: Session, slug: str) -> Theme | None:
    return session.scalar(select(Theme).where(Theme.slug == slug))


def get_color(session: Session, slug: str) -> Color | None:
    return session.scalar(select(Color).where(Color.slug == slug))


def get_sizes(session: Session, slugs: set[str]) -> list[Size]:
    return list(session.scalars(select(Size).where(Size.slug.in_(slugs))))
