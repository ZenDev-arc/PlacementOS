from sqlalchemy import Column, String, Integer, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from db.session import Base, GUID

class PhaseStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    phase_number = Column(Integer)
    phase_name = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    goals = Column(JSON) # List of goal strings
    status = Column(String, default=PhaseStatus.upcoming)

    user = relationship("User")

class DailyPlan(Base):
    __tablename__ = "daily_plans"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    date = Column(Date, index=True)
    plan = Column(JSON) # Structured JSON of tasks
    completion_pct = Column(Integer, default=0)
    generated_at = Column(Date, server_default=func.current_date())
    last_updated = Column(Date, onupdate=func.current_date())

    user = relationship("User")

