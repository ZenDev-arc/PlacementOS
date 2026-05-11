import os
import jwt
import requests
from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Clerk Configuration
CLERK_API_URL = os.getenv("CLERK_API_URL", "https://dominant-dragon-61.clerk.accounts.dev")
JWKS_URL = f"{CLERK_API_URL}/.well-known/jwks.json"

# Simple cache for JWKS keys
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        try:
            print(f"DEBUG: Fetching JWKS from {JWKS_URL}...")
            response = requests.get(JWKS_URL, timeout=5)
            response.raise_for_status()
            _jwks_cache = response.json()
            print("DEBUG: JWKS fetched successfully")
        except Exception as e:
            print(f"WARNING: Could not fetch JWKS (Timeout or Network): {e}")
            print("DEBUG: Falling back to unverified mode for development")
            return None
    return _jwks_cache

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing token")
    
    token = auth_header.split(" ")[1]
    
    try:
        # Decode without verification for now to get claims
        # In full production, you would use jwt.decode with key, audience, and issuer
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        clerk_id = decoded.get("sub")
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Invalid token: Missing 'sub'")
        
        # 3. DB Sync
        user = db.query(User).filter(User.clerk_id == clerk_id).first()
        if not user:
            # Fallback values if claims are missing
            email = decoded.get("email") or f"{clerk_id}@clerk.user"
            name = decoded.get("name") or decoded.get("first_name", "PlacementOS User")
            
            user = User(
                clerk_id=clerk_id,
                email=email,
                name=name
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
        
    except Exception as e:
        print(f"AUTH ERROR: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

