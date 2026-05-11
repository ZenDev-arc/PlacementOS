from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.session import Base, GUID

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)
    remind_at = Column(DateTime(timezone=True), nullable=False)
    is_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(200))
    body = Column(Text)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String) # 'delivered', 'failed'
    error_message = Column(Text, nullable=True)

    user = relationship("User")
