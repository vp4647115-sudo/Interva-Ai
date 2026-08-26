"""onboarding completion + welcome email state on candidate_profiles

Revision ID: b8e4f1a93c72
Revises: a7f3c2d91e04
Create Date: 2026-08-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "b8e4f1a93c72"
down_revision = "a7f3c2d91e04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Safe for existing users: every new column is nullable or has a default,
    # so pre-existing rows keep working (they simply have onboarding pending).
    op.add_column(
        "candidate_profiles",
        sa.Column("onboarding_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("onboarding_data", sa.JSON(), nullable=True),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("welcome_email_sent", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "candidate_profiles",
        sa.Column("welcome_email_sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    # Index supports the common guard query: "is this user onboarded?".
    op.create_index(
        op.f("ix_candidate_profiles_onboarding_completed"),
        "candidate_profiles",
        ["onboarding_completed"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_candidate_profiles_onboarding_completed"), table_name="candidate_profiles")
    op.drop_column("candidate_profiles", "welcome_email_sent_at")
    op.drop_column("candidate_profiles", "welcome_email_sent")
    op.drop_column("candidate_profiles", "onboarding_data")
    op.drop_column("candidate_profiles", "onboarding_completed_at")
    op.drop_column("candidate_profiles", "onboarding_completed")
