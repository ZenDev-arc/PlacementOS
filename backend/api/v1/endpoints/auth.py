from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from middleware.auth import get_current_user
import os

router = APIRouter()

@router.post("/webhook")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    # In a real app, verify the webhook signature from Clerk
    # WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")
    
    payload = await request.json()
    event_type = payload.get("type")
    
    if event_type == "user.created":
        data = payload.get("data")
        new_user = User(
            clerk_id=data.get("id"),
            email=data.get("email_addresses")[0].get("email_address"),
            name=f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            avatar_url=data.get("image_url")
        )
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
    
    return {"message": "Webhook received"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "clerk_id": current_user.clerk_id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role
    }

