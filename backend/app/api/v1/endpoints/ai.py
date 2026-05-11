from fastapi import APIRouter

from app.schemas.ai import MentorRequest, MentorResponse
from app.services.ai_mentor_service import answer_mentor_query

router = APIRouter()


@router.post("/mentor", response_model=MentorResponse)
async def ask_mentor(payload: MentorRequest) -> MentorResponse:
    return answer_mentor_query(payload)
