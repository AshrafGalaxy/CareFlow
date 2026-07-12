"""update follow ups status constraint

Revision ID: b22a7a984a52
Revises: a8ff26a43b39
Create Date: 2026-07-12 21:23:02.811117

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b22a7a984a52'
down_revision: Union[str, None] = 'a8ff26a43b39'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('follow_ups_status_check', 'follow_ups', type_='check')
    op.create_check_constraint(
        'follow_ups_status_check',
        'follow_ups',
        "status IN ('scheduled', 'requested', 'completed', 'missed', 'cancelled')"
    )


def downgrade() -> None:
    op.drop_constraint('follow_ups_status_check', 'follow_ups', type_='check')
    op.create_check_constraint(
        'follow_ups_status_check',
        'follow_ups',
        "status IN ('scheduled', 'completed', 'missed', 'cancelled')"
    )
