"""story title index for quick searching

Revision ID: f7696c81ff37
Revises: bf698a87e4cc
Create Date: 2026-03-31 14:48:26.361476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7696c81ff37'
down_revision: Union[str, Sequence[str], None] = 'bf698a87e4cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    # index on story titles for quick searching
    op.execute(
        "CREATE INDEX idx_stories_title_trgm ON stories USING gin (title gin_trgm_ops);"
    )


def downgrade() -> None:
    """Downgrade schema."""
    
    op.execute("DROP INDEX IF EXISTS idx_stories_title_trgm;")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm;")
