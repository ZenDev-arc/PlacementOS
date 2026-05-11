from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
import uuid
from db.session import Base, GUID

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    icon_name = Column(String)
    progress = Column(Integer, default=0)
    color = Column(String, default="matte-blue")
    
    # Stores the full chapters list as JSON for simplicity
    # [{title: str, done: bool, questions: int}]
    chapters = Column(JSON, default=[])

    user = relationship("User")
