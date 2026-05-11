from sqlalchemy import Column, String, Boolean, Integer, Date, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship
import uuid
import enum
from db.session import Base, GUID

class PlatformType(str, enum.Enum):
    leetcode = "leetcode"
    gfg = "gfg"
    codeforces = "codeforces"
    other = "other"

class DifficultyType(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class DSALog(Base):
    __tablename__ = "dsa_log"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    date = Column(Date)
    problem_name = Column(String, nullable=False)
    platform = Column(Enum(PlatformType))
    difficulty = Column(Enum(DifficultyType))
    topic = Column(String)
    time_taken_mins = Column(Integer)
    solved = Column(Boolean, default=True)
    attempts = Column(Integer, default=1)
    notes = Column(Text)
    problem_url = Column(String)

class SubjectType(str, enum.Enum):
    dbms = "dbms"
    os = "os"
    cn = "cn"
    oops = "oops"
    sql = "sql"
    git = "git"
    docker = "docker"
    fastapi = "fastapi"
    cloud = "cloud"
    linux = "linux"
    mlops = "mlops"
    system_design = "system_design"

class SubjectLog(Base):
    __tablename__ = "subject_log"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    subject = Column(String) # Made flexible for custom subjects
    topic = Column(String)
    date_studied = Column(Date)
    duration_mins = Column(Integer)
    confidence_score = Column(Integer) # 1-5
    notes = Column(Text)
    resources_used = Column(JSON) # Changed from ARRAY to JSON for SQLite compatibility

# Alias for backwards compatibility or naming consistency
ActivityLog = DSALog
