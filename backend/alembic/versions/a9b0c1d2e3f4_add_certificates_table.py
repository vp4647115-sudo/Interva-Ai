"""add certificates table

Revision ID: a9b0c1d2e3f4
Revises: f3a4b5c6d7e8
Create Date: 2026-09-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "a9b0c1d2e3f4"
down_revision = "f3a4b5c6d7e8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Some existing local installations created this table before it was
    # tracked by Alembic. Keep the migration safe for both new and old DBs.
    if "certificates" in sa.inspect(op.get_bind()).get_table_names():
        return
    op.create_table(
        "certificates",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("cert_id", sa.String(length=100), nullable=True),
        sa.Column("storage_key", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_certificates_user_id"), "certificates", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_certificates_user_id"), table_name="certificates")
    op.drop_table("certificates")
