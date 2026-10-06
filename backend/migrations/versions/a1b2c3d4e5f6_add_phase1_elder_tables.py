"""Add Phase 1 Elder Core tables

Revision ID: a1b2c3d4e5f6
Revises: 9279a3d7c92b
Create Date: 2026-10-06 19:53:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9279a3d7c92b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create daily_checklist_items table
    op.create_table(
        'daily_checklist_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('patient_id', sa.UUID(), nullable=False),
        sa.Column('care_episode_id', sa.UUID(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True, server_default='custom'),
        sa.Column('scheduled_time', sa.String(length=50), nullable=True),
        sa.Column('recurrence', sa.String(length=50), nullable=True, server_default='daily'),
        sa.Column('priority', sa.String(length=20), nullable=True, server_default='normal'),
        sa.Column('active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_daily_checklist_items_active'), 'daily_checklist_items', ['active'], unique=False)
    op.create_index(op.f('ix_daily_checklist_items_patient_id'), 'daily_checklist_items', ['patient_id'], unique=False)

    # Create checklist_logs table
    op.create_table(
        'checklist_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('item_id', sa.UUID(), nullable=False),
        sa.Column('patient_id', sa.UUID(), nullable=False),
        sa.Column('scheduled_for', sa.Date(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='PENDING'),
        sa.Column('source', sa.String(length=50), nullable=True, server_default='manual'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['daily_checklist_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_checklist_logs_item_id'), 'checklist_logs', ['item_id'], unique=False)
    op.create_index(op.f('ix_checklist_logs_patient_id'), 'checklist_logs', ['patient_id'], unique=False)
    op.create_index(op.f('ix_checklist_logs_scheduled_for'), 'checklist_logs', ['scheduled_for'], unique=False)
    op.create_index(op.f('ix_checklist_logs_status'), 'checklist_logs', ['status'], unique=False)

    # Create daily_checkins table
    op.create_table(
        'daily_checkins',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('patient_id', sa.UUID(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('wellness_status', sa.String(length=20), nullable=False),
        sa.Column('mood', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=True, server_default='manual'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('patient_id', 'date', name='uq_patient_daily_checkin')
    )
    op.create_index(op.f('ix_daily_checkins_date'), 'daily_checkins', ['date'], unique=False)
    op.create_index(op.f('ix_daily_checkins_patient_id'), 'daily_checkins', ['patient_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_daily_checkins_patient_id'), table_name='daily_checkins')
    op.drop_index(op.f('ix_daily_checkins_date'), table_name='daily_checkins')
    op.drop_table('daily_checkins')

    op.drop_index(op.f('ix_checklist_logs_status'), table_name='checklist_logs')
    op.drop_index(op.f('ix_checklist_logs_scheduled_for'), table_name='checklist_logs')
    op.drop_index(op.f('ix_checklist_logs_patient_id'), table_name='checklist_logs')
    op.drop_index(op.f('ix_checklist_logs_item_id'), table_name='checklist_logs')
    op.drop_table('checklist_logs')

    op.drop_index(op.f('ix_daily_checklist_items_patient_id'), table_name='daily_checklist_items')
    op.drop_index(op.f('ix_daily_checklist_items_active'), table_name='daily_checklist_items')
    op.drop_table('daily_checklist_items')
