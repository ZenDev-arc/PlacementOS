from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, JSON, Integer
from sqlalchemy.orm import relationship
from db.session import Base, GUID
import uuid
from datetime import datetime

class Habit(Base):
    __tablename__ = "habits"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=True) # Lucide icon name
    color = Column(String, nullable=True) # Hex color
    frequency = Column(String, default="daily") # daily, weekly
    target_time = Column(String, nullable=True) # e.g. "08:00 AM"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    user = relationship("User", back_populates="habits")

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    habit_id = Column(GUID(), ForeignKey("habits.id"), nullable=False)
    date = Column(DateTime, nullable=False) # Store the date of completion
    completed = Column(Boolean, default=True)

    habit = relationship("Habit", back_populates="logs")
