"""add years to experience_entries

Revision ID: a7f3c2d91e04
Revises: c3a1f7d20b45
Create Date: 2026-08-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "a7f3c2d91e04"
down_revision = "c3a1f7d20b45"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("experience_entries", sa.Column("years", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("experience_entries", "years")
