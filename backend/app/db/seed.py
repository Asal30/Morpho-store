from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Color, GarmentType, PricingRule, Size, Theme

THEMES = (
    ("toon-art", "Toon Art"),
    ("anime", "Anime"),
    ("motor", "Motor"),
    ("street-art", "Street Art"),
    ("essentials", "Essentials"),
)

GARMENTS = {
    "oversized": {
        "name": "Oversized",
        "colors": (
            ("black", "Black"),
            ("white", "White"),
            ("navy-blue", "Navy Blue"),
            ("aqua-blue", "Aqua Blue"),
            ("mint-green", "Mint Green"),
            ("baby-pink", "Baby Pink"),
            ("yellow", "Yellow"),
        ),
        "sizes": (("xs", "XS"), ("s", "S"), ("m", "M"), ("l", "L"), ("xl", "XL")),
    },
    "raglan": {
        "name": "Raglan",
        "colors": (("black", "Black"), ("blue", "Blue"), ("red", "Red"), ("pink", "Pink")),
        "sizes": (("xs", "XS"), ("s", "S"), ("m", "M"), ("l", "L"), ("2xl", "2XL")),
    },
}

PRICES = {
    ("oversized", "standard", "LKR"): 250_000,
    ("oversized", "customized", "LKR"): 280_000,
    ("raglan", "standard", "LKR"): 220_000,
    ("raglan", "customized", "LKR"): 250_000,
}


def _get_or_create(session: Session, model: type, slug: str, **values):
    instance = session.scalar(select(model).where(model.slug == slug))
    if instance is None:
        instance = model(slug=slug, **values)
        session.add(instance)
        session.flush()
    else:
        for key, value in values.items():
            setattr(instance, key, value)
    return instance


def seed_reference_data(session: Session) -> None:
    for slug, name in THEMES:
        _get_or_create(session, Theme, slug, name=name)

    sizes_by_slug: dict[str, Size] = {}
    for position, (slug, name) in enumerate(
        (("xs", "XS"), ("s", "S"), ("m", "M"), ("l", "L"), ("xl", "XL"), ("2xl", "2XL"))
    ):
        sizes_by_slug[slug] = _get_or_create(session, Size, slug, name=name, display_order=position)

    colors_by_slug: dict[str, Color] = {}
    for definition in GARMENTS.values():
        for slug, name in definition["colors"]:
            colors_by_slug[slug] = _get_or_create(session, Color, slug, name=name)

    garments_by_slug: dict[str, GarmentType] = {}
    for slug, definition in GARMENTS.items():
        garment = _get_or_create(session, GarmentType, slug, name=definition["name"])
        garment.colors = [colors_by_slug[color_slug] for color_slug, _ in definition["colors"]]
        garment.sizes = [sizes_by_slug[size_slug] for size_slug, _ in definition["sizes"]]
        garments_by_slug[slug] = garment

    for (garment_slug, kind, currency), amount_minor in PRICES.items():
        garment = garments_by_slug[garment_slug]
        rule = session.scalar(
            select(PricingRule).where(
                PricingRule.garment_type_id == garment.id,
                PricingRule.product_kind == kind,
                PricingRule.currency == currency,
            )
        )
        if rule is None:
            session.add(
                PricingRule(
                    garment_type=garment,
                    product_kind=kind,
                    currency=currency,
                    amount_minor=amount_minor,
                )
            )
        else:
            rule.amount_minor = amount_minor

    session.commit()


def main() -> None:
    with SessionLocal() as session:
        seed_reference_data(session)


if __name__ == "__main__":
    main()
