from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def uuid_string() -> str:
    return str(uuid.uuid4())


garment_colors = Table(
    "garment_colors",
    Base.metadata,
    Column("garment_type_id", ForeignKey("garment_types.id", ondelete="CASCADE"), primary_key=True),
    Column("color_id", ForeignKey("colors.id", ondelete="RESTRICT"), primary_key=True),
)

garment_sizes = Table(
    "garment_sizes",
    Base.metadata,
    Column("garment_type_id", ForeignKey("garment_types.id", ondelete="CASCADE"), primary_key=True),
    Column("size_id", ForeignKey("sizes.id", ondelete="RESTRICT"), primary_key=True),
)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Theme(Base):
    __tablename__ = "themes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class Color(Base):
    __tablename__ = "colors"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    swatch: Mapped[str | None] = mapped_column(String(30))


class Size(Base):
    __tablename__ = "sizes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(20), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)


class GarmentType(Base):
    __tablename__ = "garment_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    colors: Mapped[list[Color]] = relationship(
        secondary=garment_colors, lazy="selectin", order_by=Color.id
    )
    sizes: Mapped[list[Size]] = relationship(
        secondary=garment_sizes, lazy="selectin", order_by=Size.display_order
    )


class PricingRule(Base):
    __tablename__ = "pricing_rules"
    __table_args__ = (
        UniqueConstraint("garment_type_id", "product_kind", "currency", name="uq_pricing_rule"),
        CheckConstraint("amount_minor >= 0", name="ck_pricing_rule_amount_nonnegative"),
        CheckConstraint("product_kind IN ('standard', 'customized')", name="ck_pricing_rule_kind"),
        CheckConstraint("currency IN ('LKR', 'USD')", name="ck_pricing_rule_currency"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    garment_type_id: Mapped[int] = mapped_column(
        ForeignKey("garment_types.id", ondelete="RESTRICT"), nullable=False
    )
    product_kind: Mapped[str] = mapped_column(String(20), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    amount_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    garment_type: Mapped[GarmentType] = relationship(lazy="joined")


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(
            "category IN ('oversized', 'raglan', 'customized')", name="ck_product_category"
        ),
        CheckConstraint(
            "availability IN ('available', 'unavailable')", name="ck_product_availability"
        ),
        Index("ix_products_catalog_order", "display_order", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    garment_type_id: Mapped[int] = mapped_column(
        ForeignKey("garment_types.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    theme_id: Mapped[int | None] = mapped_column(
        ForeignKey("themes.id", ondelete="RESTRICT"), index=True
    )
    color_id: Mapped[int] = mapped_column(
        ForeignKey("colors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    availability: Mapped[str] = mapped_column(String(20), default="available", nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime, index=True)

    garment_type: Mapped[GarmentType] = relationship(lazy="joined")
    theme: Mapped[Theme | None] = relationship(lazy="joined")
    color: Mapped[Color] = relationship(lazy="joined")
    images: Mapped[list[ProductImage]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.position"
    )
    variants: Mapped[list[ProductVariant]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = (
        CheckConstraint("role IN ('primary', 'hover', 'gallery')", name="ck_product_image_role"),
        CheckConstraint("width > 0 AND height > 0", name="ck_product_image_dimensions"),
        CheckConstraint(
            "storage_key IS NOT NULL OR public_url IS NOT NULL", name="ck_product_image_reference"
        ),
        UniqueConstraint("product_id", "position", name="uq_product_image_position"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    media_asset_id: Mapped[str | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL"), index=True
    )
    storage_key: Mapped[str | None] = mapped_column(String(500))
    public_url: Mapped[str | None] = mapped_column(String(1000))
    alt_text: Mapped[str] = mapped_column(String(300), nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    product: Mapped[Product] = relationship(back_populates="images")
    media_asset: Mapped[MediaAsset | None] = relationship()


class ProductVariant(TimestampMixin, Base):
    __tablename__ = "product_variants"
    __table_args__ = (
        UniqueConstraint("product_id", "size_id", name="uq_product_variant_size"),
        CheckConstraint(
            "availability IN ('available', 'unavailable')", name="ck_variant_availability"
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    size_id: Mapped[int] = mapped_column(
        ForeignKey("sizes.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    availability: Mapped[str] = mapped_column(String(20), default="available", nullable=False)
    product: Mapped[Product] = relationship(back_populates="variants")
    size: Mapped[Size] = relationship(lazy="joined")
    prices: Mapped[list[VariantPrice]] = relationship(
        back_populates="variant", cascade="all, delete-orphan"
    )


class VariantPrice(Base):
    __tablename__ = "variant_prices"
    __table_args__ = (
        UniqueConstraint("variant_id", "currency", name="uq_variant_price_currency"),
        CheckConstraint("amount_minor >= 0", name="ck_variant_price_amount_nonnegative"),
        CheckConstraint("currency IN ('LKR', 'USD')", name="ck_variant_price_currency"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    variant_id: Mapped[str] = mapped_column(
        ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    amount_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    variant: Mapped[ProductVariant] = relationship(back_populates="prices")


class MediaAsset(TimestampMixin, Base):
    __tablename__ = "media_assets"
    __table_args__ = (
        CheckConstraint("width > 0 AND height > 0", name="ck_media_asset_dimensions"),
        CheckConstraint("size_bytes > 0", name="ck_media_asset_size"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    storage_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    public_url: Mapped[str | None] = mapped_column(String(1000))
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    csrf_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
