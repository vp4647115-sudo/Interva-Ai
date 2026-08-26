"""create communication coaching session storage

Revision ID: d4e6f7a8b9c0
Revises: c9f5a2b84d13
Create Date: 2026-08-26
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "d4e6f7a8b9c0"
down_revision = "c9f5a2b84d13"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "communication_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("mode", sa.String(length=40), nullable=False, server_default="free"),
        sa.Column("skill", sa.String(length=60), nullable=False, server_default="clarity"),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("overall_score", sa.Integer(), nullable=True),
        sa.Column("skills", sa.JSON(), nullable=True),
        sa.Column("strengths", sa.JSON(), nullable=True),
        sa.Column("weaknesses", sa.JSON(), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=True),
        sa.Column("next_exercise", sa.JSON(), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("metrics", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_communication_sessions_user_id"),
        "communication_sessions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_communication_sessions_user_id"), table_name="communication_sessions")
    op.drop_table("communication_sessions")
