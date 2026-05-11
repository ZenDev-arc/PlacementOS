from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.session import Base, GUID

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    version_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    extracted_text = Column(Text)
    tailored_for = Column(String) # e.g. "Frontend Engineer", "ML Intern"
    notes = Column(Text)
    uploaded_at = Column(Text, server_default=func.now())

    user = relationship("User")

