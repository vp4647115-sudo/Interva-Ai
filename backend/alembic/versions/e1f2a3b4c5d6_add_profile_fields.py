"""add extended profile fields (phone, location, birth_date, target_role, bio)

Revision ID: e1f2a3b4c5d6
Revises: c9f5a2b84d13
Create Date: 2026-09-08
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "e1f2a3b4c5d6"
down_revision = "d4e6f7a8b9c0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "candidate_profiles",
        sa.Column("phone", sa.String(50), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("location", sa.String(200), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("birth_date", sa.String(20), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("target_role", sa.String(200), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("bio", sa.String(2000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("candidate_profiles", "bio")
    op.drop_column("candidate_profiles", "target_role")
    op.drop_column("candidate_profiles", "birth_date")
    op.drop_column("candidate_profiles", "location")
    op.drop_column("candidate_profiles", "phone")
