from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.internship import InternshipApplication, ApplicationStatus
from middleware.auth import get_current_user
from services.hf_service import hf_service
from services.ai_service import ai_service, AITask
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="")

class ApplicationCreate(BaseModel):
    company_name: str
    role_title: str
    jd_text: Optional[str] = None
    platform: str = "other"
    status: str = "Identified"
    salary: Optional[str] = None
    notes: Optional[str] = None
    link: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    salary: Optional[str] = None

@router.post("")
async def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Normalize platform and status to match enums
    normalized_platform = data.platform.lower() if data.platform else "direct"
    # Match frontend STAGES: Identified, Applied, OA, Interview, Offer, Rejected
    normalized_status = data.status.title() if data.status else "Identified"
    if normalized_status == "Oa": normalized_status = "OA" # Special case for OA

    # 1. Initialize application
    app = InternshipApplication(
        user_id=current_user.id,
        company_name=data.company_name,
        role_title=data.role_title,
        jd_text=data.jd_text,
        platform=normalized_platform,
        status=normalized_status,
        stipend=0, # Placeholder or parse from salary
        notes=data.notes,
        jd_url=data.link,
        date_applied=date.today() if normalized_status == "Applied" else None
    )
    
    # 2. If JD text provided, parse it
    if data.jd_text:
        try:
            # Extract skills using Hugging Face JobBERT
            hf_response = await hf_service.extract_skills(data.jd_text)
            # JobBERT returns entities. We'll simplify for now.
            if isinstance(hf_response, list):
                extracted_skills = list(set([e.get("word") for e in hf_response if e.get("entity_group") == "SKILL"]))
                app.skills_required = extracted_skills
            
            # Calculate Match Score using AI Reasoning (Groq)
            # In a real app, you'd pass the user's logs/skills here
            match_prompt = f"JD: {data.jd_text}\nUser Skills: {current_user.profile.known_languages if current_user.profile else 'Not set'}"
            app.match_score = 75 # Placeholder
        except Exception as e:
            print(f"WARNING: JD Parsing failed: {e}")
            # Don't crash the whole request if AI parsing fails
            app.skills_required = []
            app.match_score = 0
            
    try:
        db.add(app)
        db.commit()
        db.refresh(app)
        return app
    except Exception as e:
        print(f"ERROR: Database commit failed for application: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("")
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(InternshipApplication).filter(InternshipApplication.user_id == current_user.id).all()

@router.patch("/{app_id}")
async def update_application(
    app_id: str,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(InternshipApplication).filter(
        InternshipApplication.id == app_id, 
        InternshipApplication.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if data.status:
        app.status = data.status
    if data.notes:
        app.notes = data.notes
    if data.company_name:
        app.company_name = data.company_name
    if data.role_title:
        app.role_title = data.role_title
        
    db.commit()
    return app

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(InternshipApplication).filter(
        InternshipApplication.id == app_id, 
        InternshipApplication.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(app)
    db.commit()
    return {"message": "Application deleted"}

