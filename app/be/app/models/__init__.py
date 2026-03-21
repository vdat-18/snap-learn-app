"""SQLAlchemy models package — import all models here for Alembic discovery."""

from app.models.base import Base
from app.models.parent_account import ParentAccount
from app.models.child_profile import ChildProfile
from app.models.captured_vocab import CapturedVocab
from app.models.mission import Mission
from app.models.badge import Badge
from app.models.leaderboard_entry import LeaderboardSnapshot
from app.models.activity_log import ActivityLog

__all__ = [
    "Base",
    "ParentAccount",
    "ChildProfile",
    "CapturedVocab",
    "Mission",
    "Badge",
    "LeaderboardSnapshot",
    "ActivityLog",
]
