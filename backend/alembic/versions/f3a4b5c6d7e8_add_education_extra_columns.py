"""add education qualification and score fields

Revision ID: f3a4b5c6d7e8
Revises: e1f2a3b4c5d6
Create Date: 2026-09-14
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "f3a4b5c6d7e8"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "education_entries",
        sa.Column("qualification_type", sa.String(50), nullable=True),
    )
    op.add_column(
        "education_entries",
        sa.Column("score_type", sa.String(20), nullable=True),
    )
    op.add_column(
        "education_entries",
        sa.Column("score_value", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("education_entries", "score_value")
    op.drop_column("education_entries", "score_type")
    op.drop_column("education_entries", "qualification_type")
