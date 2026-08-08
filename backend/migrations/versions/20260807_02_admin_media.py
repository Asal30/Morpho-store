"""Add secure admin sessions, media assets, and product archiving.

Revision ID: 20260807_02
Revises: 20260807_01
Create Date: 2026-08-07
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_02"
down_revision: str | None = "20260807_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "media_assets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("storage_key", sa.String(500), nullable=False, unique=True),
        sa.Column("public_url", sa.String(1000)),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("width > 0 AND height > 0", name="ck_media_asset_dimensions"),
        sa.CheckConstraint("size_bytes > 0", name="ck_media_asset_size"),
    )
    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("csrf_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_admin_sessions_token_hash", "admin_sessions", ["token_hash"], unique=True)
    op.create_index("ix_admin_sessions_expires_at", "admin_sessions", ["expires_at"])
    with op.batch_alter_table("products") as batch:
        batch.add_column(sa.Column("archived_at", sa.DateTime()))
        batch.create_index("ix_products_archived_at", ["archived_at"])
    with op.batch_alter_table("product_images") as batch:
        batch.add_column(sa.Column("media_asset_id", sa.String(36)))
        batch.create_foreign_key(
            "fk_product_images_media_asset_id",
            "media_assets",
            ["media_asset_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch.create_index("ix_product_images_media_asset_id", ["media_asset_id"])


def downgrade() -> None:
    with op.batch_alter_table("product_images") as batch:
        batch.drop_index("ix_product_images_media_asset_id")
        batch.drop_constraint("fk_product_images_media_asset_id", type_="foreignkey")
        batch.drop_column("media_asset_id")
    with op.batch_alter_table("products") as batch:
        batch.drop_index("ix_products_archived_at")
        batch.drop_column("archived_at")
    op.drop_table("admin_sessions")
    op.drop_table("media_assets")
