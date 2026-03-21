"""Add description_en, description_vi, description_zh columns to captured_vocab.

Revision ID: 002_descriptions
Revises: 001_initial
Create Date: 2026-03-22
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "002_descriptions"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "captured_vocab",
        sa.Column("description_en", sa.String(500), nullable=True),
    )
    op.add_column(
        "captured_vocab",
        sa.Column("description_vi", sa.String(500), nullable=True),
    )
    op.add_column(
        "captured_vocab",
        sa.Column("description_zh", sa.String(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("captured_vocab", "description_zh")
    op.drop_column("captured_vocab", "description_vi")
    op.drop_column("captured_vocab", "description_en")
