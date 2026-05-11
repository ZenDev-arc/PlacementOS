import enum
from sqlalchemy import Column, String, Integer, Date, ForeignKey, Enum, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.session import Base, GUID

class ApplicationStatus(str, enum.Enum):
    identified = "Identified"
    applied = "Applied"
    oa = "OA"
    interview = "Interview"
    offer = "Offer"
    rejected = "Rejected"
    ghosted = "Ghosted"

class PlatformType(str, enum.Enum):
    internshala = "internshala"
    linkedin = "linkedin"
    wellfound = "wellfound"
    unstop = "unstop"
    direct = "direct"
    other = "other"

class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False)
    role_title = Column(String, nullable=False)
    platform = Column(String, default="direct") # Using String to avoid DB-level enum conflicts
    jd_url = Column(String)
    jd_text = Column(Text)
    skills_required = Column(JSON) # List of extracted skills
    stipend = Column(Integer)
    duration_months = Column(Integer)
    is_remote = Column(Boolean, default=False)
    deadline = Column(Date)
    date_applied = Column(Date)
    status = Column(String, default="Identified") # Using String to avoid DB-level enum conflicts
    match_score = Column(Integer, default=0)
    match_breakdown = Column(JSON)
    notes = Column(Text)
    created_at = Column(Text, server_default=func.now())
    updated_at = Column(Text, onupdate=func.now())

    user = relationship("User")

