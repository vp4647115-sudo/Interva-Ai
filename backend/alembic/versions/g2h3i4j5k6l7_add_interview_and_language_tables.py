"""add interview and language tables

Revision ID: g2h3i4j5k6l7
Revises: a9b0c1d2e3f4
Create Date: 2026-11-28
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "g2h3i4j5k6l7"
down_revision = "a9b0c1d2e3f4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    table_names = sa.inspect(bind).get_table_names()

    if "languages" not in table_names:
        op.create_table(
            "languages",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("proficiency", sa.String(length=30), nullable=False, server_default="Intermediate"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_languages_user_id"), "languages", ["user_id"], unique=False)

    if "interview_turns" not in table_names:
        op.create_table(
            "interview_turns",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("session_id", sa.UUID(), nullable=False),
            sa.Column("turn_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("question_text", sa.Text(), nullable=False),
            sa.Column("topic", sa.String(length=120), nullable=True),
            sa.Column("difficulty", sa.String(length=20), nullable=False, server_default="medium"),
            sa.Column("answer_text", sa.Text(), nullable=True),
            sa.Column("score", sa.Float(), nullable=True),
            sa.Column("evaluation_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_interview_turns_session_id"), "interview_turns", ["session_id"], unique=False)

    if "interview_reports" not in table_names:
        op.create_table(
            "interview_reports",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("session_id", sa.UUID(), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("overall_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("technical_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("communication_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("problem_solving_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("relevance_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("fluency_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("grammar_score", sa.Float(), nullable=False, server_default="0"),
            sa.Column("strengths_json", sa.Text(), nullable=True),
            sa.Column("improvements_json", sa.Text(), nullable=True),
            sa.Column("missed_concepts_json", sa.Text(), nullable=True),
            sa.Column("recommendations_json", sa.Text(), nullable=True),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_interview_reports_session_id"), "interview_reports", ["session_id"], unique=True)
        op.create_index(op.f("ix_interview_reports_user_id"), "interview_reports", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("interview_reports")
    op.drop_table("interview_turns")
    op.drop_table("languages")
