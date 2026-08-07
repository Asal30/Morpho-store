import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.seed import GARMENTS, PRICES, THEMES, seed_reference_data
from app.models import GarmentType, PricingRule, Theme
from app.schemas.catalog import ProductCreate, ProductImageCreate
from app.services.catalog import CatalogValidationError, create_product


def payload(
    slug: str = "test-oversized-design",
    garment: str = "oversized",
    color: str = "black",
    sizes: list[str] | None = None,
) -> ProductCreate:
    return ProductCreate(
        name="Test-only Catalog Design",
        slug=slug,
        category=garment,
        garment_slug=garment,
        theme_slug="toon-art",
        color_slug=color,
        size_slugs=sizes or ["xs", "m"],
        images=[
            ProductImageCreate(
                public_url="https://media.example.test/catalog/test.webp",
                alt_text="Test-only product fixture",
                width=1200,
                height=1500,
                position=0,
                role="primary",
            )
        ],
    )


def test_reference_data_and_seed_are_idempotent(session: Session) -> None:
    seed_reference_data(session)
    assert session.scalar(select(func.count()).select_from(Theme)) == len(THEMES)
    assert session.scalar(select(func.count()).select_from(GarmentType)) == 2
    assert session.scalar(select(func.count()).select_from(PricingRule)) == len(PRICES)
    oversized = session.scalar(select(GarmentType).where(GarmentType.slug == "oversized"))
    raglan = session.scalar(select(GarmentType).where(GarmentType.slug == "raglan"))
    assert [color.name for color in oversized.colors] == [
        name for _, name in GARMENTS["oversized"]["colors"]
    ]
    assert {size.name for size in oversized.sizes} == {"XS", "S", "M", "L", "XL"}
    assert {size.name for size in raglan.sizes} == {"XS", "S", "M", "L", "2XL"}


def test_authoritative_lkr_prices_and_missing_usd(session: Session) -> None:
    rules = list(session.scalars(select(PricingRule)))
    actual = {
        (rule.garment_type.slug, rule.product_kind, rule.currency): rule.amount_minor
        for rule in rules
    }
    assert actual == PRICES
    assert all(rule.currency != "USD" for rule in rules)


def test_valid_oversized_and_raglan_configuration(session: Session) -> None:
    oversized = create_product(session, payload())
    raglan = create_product(
        session,
        payload(
            slug="test-raglan-design",
            garment="raglan",
            color="pink",
            sizes=["xs", "2xl"],
        ),
    )
    session.commit()
    assert {variant.size.slug for variant in oversized.variants} == {"xs", "m"}
    assert {variant.size.slug for variant in raglan.variants} == {"xs", "2xl"}


def test_invalid_garment_color_combination(session: Session) -> None:
    with pytest.raises(CatalogValidationError, match="Color"):
        create_product(session, payload(color="pink"))


@pytest.mark.parametrize(("garment", "invalid_size"), (("oversized", "2xl"), ("raglan", "xl")))
def test_invalid_garment_size_combination(
    session: Session, garment: str, invalid_size: str
) -> None:
    with pytest.raises(CatalogValidationError, match="Size"):
        create_product(session, payload(garment=garment, sizes=[invalid_size]))


def test_product_create_schema_rejects_invalid_slug() -> None:
    with pytest.raises(ValidationError):
        payload(slug="Not a slug")


def test_empty_catalog_and_options(client: TestClient) -> None:
    response = client.get("/api/products")
    assert response.status_code == 200
    assert response.json() == {"items": [], "page": 1, "pageSize": 24, "total": 0, "pages": 0}
    options = client.get("/api/catalog/options").json()
    oversized = next(item for item in options["garments"] if item["id"] == "oversized")
    assert oversized["standardPrices"] == {"LKR": {"minorAmount": 250_000, "currency": "LKR"}}
    assert "USD" not in oversized["standardPrices"]


def test_lookup_unknown_slug(client: TestClient) -> None:
    response = client.get("/api/products/does-not-exist")
    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found"}


def test_product_lookup_pagination_and_filtering(session: Session, client: TestClient) -> None:
    first = create_product(session, payload(slug="test-first"))
    second = create_product(
        session,
        payload(slug="test-second", garment="raglan", color="red", sizes=["2xl"]),
    )
    session.commit()

    page = client.get("/api/products?pageSize=1&page=2")
    assert page.status_code == 200
    assert page.json()["total"] == 2
    assert page.json()["pages"] == 2
    assert len(page.json()["items"]) == 1

    filtered = client.get("/api/products?garment=raglan&theme=toon-art&color=red&size=2xl")
    assert [item["id"] for item in filtered.json()["items"]] == [second.id]
    assert client.get(f"/api/products/{first.slug}").json()["prices"] == {
        "LKR": {"minorAmount": 250_000, "currency": "LKR"}
    }
    assert client.get("/api/products?page=0").status_code == 422
