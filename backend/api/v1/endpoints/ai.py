from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.ai import AISession, ChatMode
from middleware.auth import get_current_user
from services.ai_service import ai_service, AITask
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    mode: ChatMode = ChatMode.teaching
    subject: Optional[str] = None
    session_id: Optional[str] = None

class MatchRequest(BaseModel):
    jd_text: str
    resume_id: Optional[str] = None

class RoadmapRequest(BaseModel):
    target_company: str
    target_role: str
    session_id: Optional[str] = None

# Move chat route up to avoid any potential shadowing
@router.post("/chat")
async def chat_with_ai(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if data.session_id:
            session = db.query(AISession).filter(AISession.id == data.session_id).first()
            if not session or str(session.user_id) != str(current_user.id):
                raise HTTPException(status_code=404, detail="Session not found or unauthorized")
        else:
            inferred_subject = data.subject or (" ".join(data.message.split()[:4]) if data.message else "General Inquiry")
            session = AISession(user_id=current_user.id, mode=data.mode, subject=inferred_subject, messages=[])
            db.add(session)
            db.flush()
        
        if data.subject: session.subject = data.subject

        history = session.messages if session.messages is not None else []
        history.append({"role": "user", "content": data.message})
        
        active_subject = data.subject or session.subject or "CS Fundamentals"
        system_prompt = "You are the PlacementOS AI Mentor."
        if data.mode == ChatMode.teaching:
            system_prompt = "You are an encouraging Socratic Mentor. Guide the student toward understanding."
        elif data.mode == ChatMode.interview:
            system_prompt = f"You are a Technical Interviewer specializing in {active_subject}."

        task_map = {
            ChatMode.teaching: AITask.TEACHING,
            ChatMode.interview: AITask.INTERVIEW_PREP,
            ChatMode.explain: AITask.TEACHING,
            ChatMode.code_review: AITask.TEACHING,
        }
        target_task = task_map.get(data.mode, AITask.TEACHING)
        context_prompt = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in history])
        
        response_text = await ai_service.execute_task(target_task, context_prompt, system_prompt)
        
        history.append({"role": "assistant", "content": response_text})
        session.messages = history
        db.commit()
        
        return {"response": response_text, "session_id": str(session.id), "history": history}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")


@router.get("/sessions")
async def list_ai_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AISession).filter(AISession.user_id == current_user.id).order_by(AISession.updated_at.desc()).all()

@router.get("/sessions/{session_id}")
async def get_ai_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(AISession).filter(AISession.id == session_id, AISession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/sessions/{session_id}")
async def delete_ai_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(AISession).filter(AISession.id == session_id, AISession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        db.delete(session)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match")
async def match_resume_with_jd(
    data: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Starting JD Match for user {current_user.email}")
    # 1. Get Resume Content and Profile
    resume_text = ""
    if data.resume_id:
        from models.resume import ResumeVersion
        resume_record = db.query(ResumeVersion).filter(
            ResumeVersion.id == data.resume_id,
            ResumeVersion.user_id == current_user.id
        ).first()
        if resume_record and resume_record.extracted_text:
            resume_text = resume_record.extracted_text
            print(f"DEBUG: Using extracted text from resume {data.resume_id}")

    try:
        from models.user import OnboardingProfile
        profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    except Exception as e:
        print(f"DEBUG: Error fetching profile: {e}")
        profile = None
    
    profile_context = "No profile data."
    if profile:
        profile_context = f"Skills: {profile.known_languages}. Goals: {profile.target_companies}."

    # 2. Build prompt
    prompt = f"RESUME CONTENT:\n{resume_text}\n\nUSER PROFILE:\n{profile_context}\n\nJOB DESCRIPTION:\n{data.jd_text}"
    system_prompt = (
        "You are an Expert Recruiter. Analyze how well the Resume matches the Job Description. "
        "Return a clear report with: Match Score (0-100), Matching Skills, Missing Skills, and 3 specific tips to improve the match."
    )

    # 3. Call AI
    print("DEBUG: Calling AI for JD Matching...")
    response = await ai_service.execute_task(AITask.JD_MATCHING, prompt, system_prompt)
    print("DEBUG: AI Match Response received")
    return {"analysis": response}

@router.post("/roadmap")
async def generate_career_roadmap(
    data: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if data.session_id:
            session = db.query(AISession).filter(AISession.id == data.session_id, AISession.user_id == current_user.id).first()
            if not session: raise HTTPException(status_code=404, detail="Session not found")
        else:
            session = AISession(user_id=current_user.id, mode=ChatMode.roadmap, subject=f"{data.target_role} @ {data.target_company}", messages=[])
            db.add(session)
            db.flush()

        from models.user import OnboardingProfile
        profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
        user_context = f"Target: {data.target_role} at {data.target_company}. Skills: {profile.known_languages if profile else 'None'}."

        system_prompt = "You are a Senior Career Coach. Generate a 4-week roadmap."
        response = await ai_service.execute_task(AITask.ROADMAP, user_context, system_prompt)
        
        history = session.messages if session.messages is not None else []
        history.append({"role": "user", "content": f"Roadmap for {data.target_role} at {data.target_company}"})
        history.append({"role": "assistant", "content": response})
        session.messages = history
        db.commit()

        return {"roadmap": response, "session_id": str(session.id)}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Roadmap Error: {str(e)}")

