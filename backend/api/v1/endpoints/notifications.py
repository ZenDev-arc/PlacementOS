from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User, DeviceToken
from middleware.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class DeviceTokenCreate(BaseModel):
    token: str
    platform: Optional[str] = "web"

@router.post("/register-device")
async def register_device(
    payload: DeviceTokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if token already exists for another user
    existing = db.query(DeviceToken).filter(DeviceToken.token == payload.token).first()
    if existing:
        if existing.user_id != current_user.id:
            existing.user_id = current_user.id
            existing.platform = payload.platform
            db.commit()
        return {"status": "success", "message": "Token updated"}
    
    new_token = DeviceToken(
        user_id=current_user.id,
        token=payload.token,
        platform=payload.platform
    )
    db.add(new_token)
    db.commit()
    return {"status": "success", "message": "Token registered"}

@router.delete("/unregister-device/{token}")
async def unregister_device(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(DeviceToken).filter(
        DeviceToken.token == token,
        DeviceToken.user_id == current_user.id
    ).delete()
    db.commit()
    return {"status": "success", "message": "Token removed"}
