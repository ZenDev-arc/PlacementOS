from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User, OnboardingProfile
from middleware.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime, timedelta

router = APIRouter(prefix="", redirect_slashes=False)

class OnboardingSubmit(BaseModel):
    target_companies: List[str]
    target_package_min: int
    target_package_max: int
    dsa_level: str
    ml_level: str
    known_languages: List[str]
    hours_per_day: int
    prep_start_date: date
    target_placement_date: date
    has_internship: bool
    internship_status: str

@router.post("")
async def submit_onboarding(
    data: OnboardingSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if profile already exists
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    
    # Create or Update Profile
    if profile:
        for key, value in data.dict().items():
            setattr(profile, key, value)
    else:
        profile = OnboardingProfile(
            user_id=current_user.id,
            **data.dict()
        )
        db.add(profile)
    
    db.flush() # Get profile ID and ensure user_id is set
    
    # Generate Roadmap logic
    from services.roadmap_service import RoadmapService
    await RoadmapService.generate_roadmap(db, profile)
    
    db.commit()
    return {"message": "Onboarding completed and roadmap generated", "profile_id": str(profile.id)}

@router.get("/status")
async def check_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    return {"is_completed": profile is not None}

