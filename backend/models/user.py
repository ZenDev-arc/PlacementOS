import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Enum, Date, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.session import Base

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

from db.session import Base, GUID

class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    avatar_url = Column(String)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("OnboardingProfile", back_populates="user", uselist=False)
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")

class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    target_companies = Column(JSON)
    target_package_min = Column(Integer)
    target_package_max = Column(Integer)
    dsa_level = Column(String) # Enum(beginner, intermediate, advanced)
    ml_level = Column(String) # Enum(beginner, intermediate, advanced)
    known_languages = Column(JSON)
    hours_per_day = Column(Integer)
    prep_start_date = Column(Date)
    target_placement_date = Column(Date)
    has_internship = Column(Boolean, default=False)
    internship_status = Column(String) # Enum(not_started, searching, ongoing, completed)
    completed_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="profile")

