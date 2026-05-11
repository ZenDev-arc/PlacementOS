from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from db.session import get_db
from models.habit import Habit, HabitLog
from models.user import User
from middleware.auth import get_current_user
from pydantic import BaseModel
import uuid

router = APIRouter()

class HabitLogSchema(BaseModel):
    date: datetime
    completed: bool

class HabitCreate(BaseModel):
    name: str
    icon: Optional[str] = "Zap"
    color: Optional[str] = "#6366f1"
    frequency: Optional[str] = "daily"
    target_time: Optional[str] = None

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    frequency: Optional[str] = None

class HabitResponse(BaseModel):
    id: uuid.UUID
    name: str
    icon: Optional[str]
    color: Optional[str]
    frequency: str
    target_time: Optional[str]
    created_at: datetime
    logs: List[HabitLogSchema] = []

    class Config:
        from_attributes = True

@router.get("", response_model=List[HabitResponse])
def get_habits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()

@router.post("", response_model=HabitResponse)
def create_habit(
    habit_in: HabitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = Habit(
        user_id=current_user.id,
        name=habit_in.name,
        icon=habit_in.icon,
        color=habit_in.color,
        frequency=habit_in.frequency,
        target_time=habit_in.target_time
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

@router.post("/{habit_id}/toggle")
def toggle_habit(
    habit_id: uuid.UUID,
    date_str: Optional[str] = None, # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    if date_str:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        target_date = datetime.utcnow().date()
    
    # Check if log exists for this date
    # Note: We compare date part only
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = datetime.combine(target_date, datetime.max.time())
    
    log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date >= start_of_day,
        HabitLog.date <= end_of_day
    ).first()
    
    if log:
        db.delete(log)
        action = "removed"
    else:
        log = HabitLog(habit_id=habit_id, date=start_of_day)
        db.add(log)
        action = "added"
    
    db.commit()
    return {"status": "success", "action": action}

@router.delete("/{habit_id}")
def delete_habit(
    habit_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        print(f"DEBUG: Attempting to delete habit {habit_id} for user {current_user.id}")
        habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
        if not habit:
            print(f"DEBUG: Habit {habit_id} not found for this user")
            raise HTTPException(status_code=404, detail="Habit not found")
        
        db.delete(habit)
        db.commit()
        print(f"DEBUG: Habit {habit_id} deleted successfully")
        return {"status": "success"}
    except Exception as e:
        print(f"ERROR deleting habit: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
