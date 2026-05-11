from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Date, DateTime
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DsaDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), default="Student")

    tasks: Mapped[list["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    study_sessions: Mapped[list["StudySession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    dsa_problems: Mapped[list["DsaProblem"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    applications: Mapped[list["InternshipApplication"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(80), default="General")
    status: Mapped[TaskStatus] = mapped_column(SqlEnum(TaskStatus), default=TaskStatus.TODO)
    priority: Mapped[TaskPriority] = mapped_column(SqlEnum(TaskPriority), default=TaskPriority.MEDIUM)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    user: Mapped[User] = relationship(back_populates="tasks")


class StudySession(TimestampMixin, Base):
    __tablename__ = "study_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    subject: Mapped[str] = mapped_column(String(80))
    minutes: Mapped[int] = mapped_column(Integer)
    studied_on: Mapped[date] = mapped_column(Date, default=date.today)
    notes: Mapped[str] = mapped_column(Text, default="")

    user: Mapped[User] = relationship(back_populates="study_sessions")


class DsaProblem(TimestampMixin, Base):
    __tablename__ = "dsa_problems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    topic: Mapped[str] = mapped_column(String(80), index=True)
    difficulty: Mapped[DsaDifficulty] = mapped_column(SqlEnum(DsaDifficulty), default=DsaDifficulty.MEDIUM)
    platform: Mapped[str] = mapped_column(String(80), default="LeetCode")
    solved_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    needs_revision: Mapped[int] = mapped_column(Integer, default=1)

    user: Mapped[User] = relationship(back_populates="dsa_problems")


class InternshipApplication(TimestampMixin, Base):
    __tablename__ = "internship_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    company: Mapped[str] = mapped_column(String(140), index=True)
    role: Mapped[str] = mapped_column(String(140))
    status: Mapped[ApplicationStatus] = mapped_column(SqlEnum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    applied_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    source: Mapped[str] = mapped_column(String(120), default="Manual")
    notes: Mapped[str] = mapped_column(Text, default="")

    user: Mapped[User] = relationship(back_populates="applications")
