from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.subject import Subject
from middleware.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="")

class ChapterSchema(BaseModel):
    title: str
    done: bool
    questions: int

class SubjectCreate(BaseModel):
    title: str
    icon_name: Optional[str] = "BookOpen"
    chapters: List[ChapterSchema]

class SubjectUpdate(BaseModel):
    progress: Optional[int] = None
    chapters: Optional[List[ChapterSchema]] = None

@router.get("")
async def list_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Subject).filter(Subject.user_id == current_user.id).all()

@router.post("")
async def create_subject(
    data: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Creating subject '{data.title}' for user {current_user.id}")
    try:
        # Calculate initial progress
        done_count = sum(1 for c in data.chapters if c.done)
        progress = int((done_count / len(data.chapters)) * 100) if data.chapters else 0

        new_subject = Subject(
            user_id=current_user.id,
            title=data.title,
            icon_name=data.icon_name,
            chapters=[c.dict() for c in data.chapters],
            progress=progress
        )
        db.add(new_subject)
        db.commit()
        db.refresh(new_subject)
        print(f"DEBUG: Successfully created subject {new_subject.id}")
        return new_subject
    except Exception as e:
        print(f"ERROR: Subject creation failed: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{subject_id}")
async def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if data.chapters is not None:
        subject.chapters = [c.dict() for c in data.chapters]
        # Auto-calculate progress if not provided
        if data.progress is None:
            done_count = sum(1 for c in data.chapters if c.done)
            subject.progress = int((done_count / len(data.chapters)) * 100) if data.chapters else 0
            
    if data.progress is not None:
        subject.progress = data.progress
        
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"status": "success"}
