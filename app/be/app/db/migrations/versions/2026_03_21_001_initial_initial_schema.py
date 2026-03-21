"""Initial schema — all 7 tables with indexes.

Revision ID: 001_initial
Revises: None
Create Date: 2026-03-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- parent_account ---
    op.create_table(
        "parent_account",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("settings", postgresql.JSONB(), server_default="{}", nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("idx_parent_email", "parent_account", ["email"])

    # --- child_profile ---
    op.create_table(
        "child_profile",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("avatar_id", sa.String(50), server_default="'default'", nullable=True),
        sa.Column("target_language", sa.String(5), server_default="'en'", nullable=True),
        sa.Column("secondary_language", sa.String(5), nullable=True),
        sa.Column("total_xp", sa.Integer(), server_default="0", nullable=False),
        sa.Column("level", sa.Integer(), server_default="1", nullable=False),
        sa.Column("current_streak", sa.Integer(), server_default="0", nullable=False),
        sa.Column("longest_streak", sa.Integer(), server_default="0", nullable=False),
        sa.Column("streak_date", sa.Date(), nullable=True),
        sa.Column("daily_time_limit_minutes", sa.Integer(), server_default="30", nullable=False),
        sa.Column("photo_storage_enabled", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("leaderboard_visibility", sa.String(20), server_default="'global'", nullable=True),
        sa.Column("settings", postgresql.JSONB(), server_default="{}", nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["parent_id"], ["parent_account.id"], ondelete="CASCADE"),
    )

    # --- captured_vocab ---
    op.create_table(
        "captured_vocab",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("word_en", sa.String(200), nullable=False),
        sa.Column("word_vi", sa.String(200), nullable=False),
        sa.Column("word_zh", sa.String(200), nullable=False),
        sa.Column("pinyin", sa.String(200), nullable=True),
        sa.Column("phonetic_en", sa.String(200), nullable=True),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("rarity_tier", sa.String(20), server_default="'common'", nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("fun_fact_vi", sa.String(500), nullable=True),
        sa.Column("example_sentence_en", sa.String(500), nullable=True),
        sa.Column("example_sentence_vi", sa.String(500), nullable=True),
        sa.Column("example_sentence_zh", sa.String(500), nullable=True),
        sa.Column("points_earned", sa.Integer(), nullable=True),
        sa.Column("mastery_en", sa.Integer(), server_default="0", nullable=False),
        sa.Column("mastery_vi", sa.Integer(), server_default="0", nullable=False),
        sa.Column("mastery_zh", sa.Integer(), server_default="0", nullable=False),
        sa.Column("evolved", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("photo_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["child_id"], ["child_profile.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("child_id", "word_en", "word_vi", name="uq_child_word"),
    )
    op.create_index("idx_captured_vocab_child_word", "captured_vocab", ["child_id", "word_en", "word_vi"])
    op.create_index("idx_captured_vocab_child_cat", "captured_vocab", ["child_id", "category"])

    # --- mission ---
    op.create_table(
        "mission",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("description_vi", sa.String(300), nullable=False),
        sa.Column("target_count", sa.Integer(), nullable=False),
        sa.Column("current_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("reward_xp", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), server_default="'active'", nullable=False),
        sa.Column("match_criteria", postgresql.JSONB(), nullable=True),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["child_id"], ["child_profile.id"], ondelete="CASCADE"),
    )
    op.create_index("idx_mission_child_status", "mission", ["child_id", "status", "expires_at"])

    # --- badge ---
    op.create_table(
        "badge",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("badge_type", sa.String(50), nullable=False),
        sa.Column("badge_name_vi", sa.String(100), nullable=False),
        sa.Column("description_vi", sa.String(300), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["child_id"], ["child_profile.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("child_id", "badge_type", name="uq_child_badge_type"),
    )

    # --- leaderboard_snapshot ---
    op.create_table(
        "leaderboard_snapshot",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("period", sa.String(10), nullable=False),
        sa.Column("total_points", sa.Integer(), nullable=True),
        sa.Column("final_rank", sa.Integer(), nullable=True),
        sa.Column("category_points", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["child_id"], ["child_profile.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "idx_leaderboard_scope",
        "leaderboard_snapshot",
        ["scope", "period", sa.text("total_points DESC")],
    )

    # --- activity_log ---
    op.create_table(
        "activity_log",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("event_data", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["child_id"], ["child_profile.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "idx_activity_child_time",
        "activity_log",
        ["child_id", sa.text("created_at DESC")],
    )


def downgrade() -> None:
    op.drop_table("activity_log")
    op.drop_table("leaderboard_snapshot")
    op.drop_table("badge")
    op.drop_table("mission")
    op.drop_table("captured_vocab")
    op.drop_table("child_profile")
    op.drop_table("parent_account")
