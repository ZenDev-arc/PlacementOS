from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.resume import ResumeVersion
from middleware.auth import get_current_user
from services.storage_service import storage_service
from services.ai_service import ai_service, AITask
from typing import Optional
import uuid

router = APIRouter(redirect_slashes=False)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    version_name: str = Form(...),
    tailored_for: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # 1. Upload to Supabase
    file_data = await file.read()
    file_url = await storage_service.upload_resume(str(current_user.id), f"{uuid.uuid4()}.pdf", file_data)
    
    # 2. Extract Text from PDF
    extracted_text = ""
    try:
        from pypdf import PdfReader
        import io
        reader = PdfReader(io.BytesIO(file_data))
        for page in reader.pages:
            extracted_text += page.extract_text() + "\n"
        print(f"DEBUG: Extracted {len(extracted_text)} chars from resume")
    except Exception as e:
        print(f"ERROR: Could not extract text from PDF: {e}")

    # 3. Save to DB
    resume = ResumeVersion(
        user_id=current_user.id,
        version_name=version_name,
        file_url=file_url,
        extracted_text=extracted_text,
        tailored_for=tailored_for
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return resume

@router.get("")
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ResumeVersion).filter(ResumeVersion.user_id == current_user.id).all()

@router.post("/{resume_id}/review")
async def review_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(ResumeVersion).filter(
        ResumeVersion.id == resume_id,
        ResumeVersion.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # 3. AI Review with Gemini 1.5 Flash
    # In a real app, you would pass the actual resume text (extracted via OCR/PDF parser)
    # and the user's logs for comparison.
    prompt = f"Resume for {resume.tailored_for or 'General Role'}. Analyze its strength based on industry standards."
    system_prompt = "You are a senior recruiter at a top tech company. Provide a brutal and honest review of this resume."
    
    review_text = await ai_service.execute_task(AITask.RESUME_REVIEW, prompt, system_prompt)
    
    return {"review": review_text}

