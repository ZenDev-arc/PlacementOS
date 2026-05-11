import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class StorageService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if url and key:
            self.supabase: Client = create_client(url, key)
        else:
            print("WARNING: Supabase credentials not found. Running Storage Service in Mock Mode.")
            self.supabase = None
        self.bucket_name = "resumes"

    async def upload_resume(self, user_id: str, file_name: str, file_data: bytes):
        if not self.supabase:
            return "Error: Storage service not configured."
            
        path = f"{user_id}/{file_name}"
        # In a real app, you'd handle duplicates or versioning
        self.supabase.storage.from_(self.bucket_name).upload(
            path=path,
            file=file_data,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get public URL
        return self.supabase.storage.from_(self.bucket_name).get_public_url(path)

storage_service = StorageService()
