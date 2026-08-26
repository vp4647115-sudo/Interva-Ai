"""add atomic welcome email claim

Revision ID: c9f5a2b84d13
Revises: b8e4f1a93c72
Create Date: 2026-08-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "c9f5a2b84d13"
down_revision = "b8e4f1a93c72"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "candidate_profiles",
        sa.Column("welcome_email_claimed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("candidate_profiles", "welcome_email_claimed")
