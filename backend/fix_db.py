from sqlalchemy import create_engine, text
import os
from pathlib import Path
from dotenv import load_dotenv

# Load env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in .env")
    exit(1)

# Ensure it's using the correct driver if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def fix_db():
    try:
        with engine.connect() as conn:
            print("Checking resume_versions table...")
            # Add extracted_text column if not exists
            conn.execute(text("ALTER TABLE resume_versions ADD COLUMN IF NOT EXISTS extracted_text TEXT"))
            conn.commit()
            print("Successfully added extracted_text column to resume_versions")
            
            # Also ensure onboarding_profiles table exists and is correct
            # Base.metadata.create_all(bind=engine) will handle missing tables 
            # but we already have those models in models.user
    except Exception as e:
        print(f"ERROR fixing database: {e}")

if __name__ == "__main__":
    fix_db()
