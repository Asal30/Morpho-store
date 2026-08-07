"""Create the MORPHO catalog domain.

Revision ID: 20260807_01
Revises:
Create Date: 2026-08-07
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "themes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "colors",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("swatch", sa.String(30)),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "sizes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(20), nullable=False),
        sa.Column("name", sa.String(20), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "garment_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "garment_colors",
        sa.Column("garment_type_id", sa.Integer(), nullable=False),
        sa.Column("color_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["garment_type_id"], ["garment_types.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["color_id"], ["colors.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("garment_type_id", "color_id"),
    )
    op.create_table(
        "garment_sizes",
        sa.Column("garment_type_id", sa.Integer(), nullable=False),
        sa.Column("size_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["garment_type_id"], ["garment_types.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["size_id"], ["sizes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("garment_type_id", "size_id"),
    )
    op.create_table(
        "pricing_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("garment_type_id", sa.Integer(), nullable=False),
        sa.Column("product_kind", sa.String(20), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("amount_minor", sa.Integer(), nullable=False),
        sa.CheckConstraint("amount_minor >= 0", name="ck_pricing_rule_amount_nonnegative"),
        sa.CheckConstraint(
            "product_kind IN ('standard', 'customized')", name="ck_pricing_rule_kind"
        ),
        sa.CheckConstraint("currency IN ('LKR', 'USD')", name="ck_pricing_rule_currency"),
        sa.ForeignKeyConstraint(["garment_type_id"], ["garment_types.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("garment_type_id", "product_kind", "currency", name="uq_pricing_rule"),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("slug", sa.String(160), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("garment_type_id", sa.Integer(), nullable=False),
        sa.Column("theme_id", sa.Integer()),
        sa.Column("color_id", sa.Integer(), nullable=False),
        sa.Column("availability", sa.String(20), nullable=False, server_default="available"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "category IN ('oversized', 'raglan', 'customized')", name="ck_product_category"
        ),
        sa.CheckConstraint(
            "availability IN ('available', 'unavailable')", name="ck_product_availability"
        ),
        sa.ForeignKeyConstraint(["garment_type_id"], ["garment_types.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["theme_id"], ["themes.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["color_id"], ["colors.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_products_garment_type_id", "products", ["garment_type_id"])
    op.create_index("ix_products_theme_id", "products", ["theme_id"])
    op.create_index("ix_products_color_id", "products", ["color_id"])
    op.create_index("ix_products_catalog_order", "products", ["display_order", "created_at"])
    op.create_table(
        "product_images",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("product_id", sa.String(36), nullable=False),
        sa.Column("storage_key", sa.String(500)),
        sa.Column("public_url", sa.String(1000)),
        sa.Column("alt_text", sa.String(300), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.CheckConstraint("role IN ('primary', 'hover', 'gallery')", name="ck_product_image_role"),
        sa.CheckConstraint("width > 0 AND height > 0", name="ck_product_image_dimensions"),
        sa.CheckConstraint(
            "storage_key IS NOT NULL OR public_url IS NOT NULL", name="ck_product_image_reference"
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("product_id", "position", name="uq_product_image_position"),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])
    op.create_table(
        "product_variants",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("product_id", sa.String(36), nullable=False),
        sa.Column("size_id", sa.Integer(), nullable=False),
        sa.Column("availability", sa.String(20), nullable=False, server_default="available"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "availability IN ('available', 'unavailable')", name="ck_variant_availability"
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["size_id"], ["sizes.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("product_id", "size_id", name="uq_product_variant_size"),
    )
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])
    op.create_index("ix_product_variants_size_id", "product_variants", ["size_id"])
    op.create_table(
        "variant_prices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("variant_id", sa.String(36), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("amount_minor", sa.Integer(), nullable=False),
        sa.CheckConstraint("amount_minor >= 0", name="ck_variant_price_amount_nonnegative"),
        sa.CheckConstraint("currency IN ('LKR', 'USD')", name="ck_variant_price_currency"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("variant_id", "currency", name="uq_variant_price_currency"),
    )
    op.create_index("ix_variant_prices_variant_id", "variant_prices", ["variant_id"])


def downgrade() -> None:
    op.drop_table("variant_prices")
    op.drop_table("product_variants")
    op.drop_table("product_images")
    op.drop_table("products")
    op.drop_table("pricing_rules")
    op.drop_table("garment_sizes")
    op.drop_table("garment_colors")
    op.drop_table("garment_types")
    op.drop_table("sizes")
    op.drop_table("colors")
    op.drop_table("themes")
