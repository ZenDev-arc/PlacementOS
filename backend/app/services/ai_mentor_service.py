from app.schemas.ai import MentorRequest, MentorResponse


def answer_mentor_query(payload: MentorRequest) -> MentorResponse:
    question = payload.question.strip()
    return MentorResponse(
        answer=(
            "Based on your current dashboard, prioritize one DSA weak topic, one CS core revision block, "
            f"and one placement action. Your query was: '{question}'. The next version will route this "
            "through LangGraph agents with real user memory and analytics."
        ),
        recommended_actions=[
            "Spend 60 minutes on graph traversal patterns.",
            "Revise DBMS indexing and transactions with flashcards.",
            "Update your internship tracker after every application response.",
        ],
        routed_agents=["supervisor", "study_planner", "dsa_coach"],
    )
