import enum
from sqlalchemy import Column, String, ForeignKey, Enum, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.session import Base, GUID

class ChatMode(str, enum.Enum):
    teaching = "teaching"
    planning = "planning"
    analysis = "analysis"
    application_help = "application_help"
    interview = "interview"
    code_review = "code_review"
    explain = "explain"
    roadmap = "roadmap"

class AISession(Base):
    __tablename__ = "ai_sessions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    mode = Column(Enum(ChatMode), default=ChatMode.teaching)
    subject = Column(String)
    messages = Column(JSON) # List of {role: string, content: string}
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")

