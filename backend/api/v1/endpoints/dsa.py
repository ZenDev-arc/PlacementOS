from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.log import DSALog
from middleware.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()

class DSALogCreate(BaseModel):
    problem_name: str
    platform: str
    difficulty: str
    topic: Optional[str] = None
    time_taken_mins: Optional[int] = None
    problem_url: Optional[str] = None
    notes: Optional[str] = None

@router.post("/log")
async def log_dsa_problem(
    data: DSALogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_log = DSALog(
        user_id=current_user.id,
        date=date.today(),
        problem_name=data.problem_name,
        platform=data.platform,
        difficulty=data.difficulty,
        topic=data.topic,
        time_taken_mins=data.time_taken_mins,
        problem_url=data.problem_url,
        notes=data.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/problems")
async def get_dsa_problems(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(DSALog).filter(DSALog.user_id == current_user.id).order_by(DSALog.id.desc()).all()

@router.get("/stats")
async def get_dsa_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(DSALog).filter(DSALog.user_id == current_user.id).all()
    
    topic_counts = {}
    for l in logs:
        topic = l.topic or "General"
        topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
    # Normalize to percentages for the UI
    total = len(logs) if logs else 1
    topic_stats = {t: round((c / total) * 100) for t, c in topic_counts.items()}
    
    return {
        "total_solved": len(logs),
        "difficulty_breakdown": {
            "easy": len([l for l in logs if l.difficulty.lower() == "easy"]),
            "medium": len([l for l in logs if l.difficulty.lower() == "medium"]),
            "hard": len([l for l in logs if l.difficulty.lower() == "hard"]),
        },
        "topic_stats": topic_stats
    }

