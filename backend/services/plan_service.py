from sqlalchemy.orm import Session
from datetime import date
import json
from models.user import OnboardingProfile
from models.roadmap import RoadmapPhase, DailyPlan, PhaseStatus
from services.ai_service import ai_service, AITask

class PlanService:
    @staticmethod
    async def generate_daily_plan(db: Session, user_id: str):
        # 1. Get user context
        profile = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == user_id).first()
        active_phase = db.query(RoadmapPhase).filter(
            RoadmapPhase.user_id == user_id,
            RoadmapPhase.status == PhaseStatus.active
        ).first()
        
        if not profile or not active_phase:
            return None

        # 2. Construct prompt for AI
        system_prompt = """
        You are the PlacementOS Daily Planner. Your goal is to generate a structured study plan for an engineering student.
        The plan must be realistic and based on the student's available hours and current preparation phase.
        Output MUST be in strict JSON format.
        """
        
        prompt = f"""
        Student Profile:
        - Target Companies: {profile.target_companies}
        - DSA Level: {profile.dsa_level}
        - Hours per day: {profile.hours_per_day}
        - Known Languages: {profile.known_languages}
        
        Current Preparation Phase: {active_phase.phase_name}
        Phase Goals: {active_phase.goals}
        
        Generate a daily plan for today. Include specific DSA topics, a CS subject topic, and a project task.
        The total time estimate should not exceed {profile.hours_per_day} hours.
        
        Return ONLY a JSON object with:
        {{
          "focus": "string summary",
          "tasks": [
            {{ "type": "dsa" | "subject" | "project" | "application", "task": "string description", "time_estimate": "minutes e.g. 90m" }}
          ]
        }}
        """

        # 3. Call AI
        response_text = await ai_service.execute_task(AITask.PLAN_GENERATION, prompt, system_prompt)
        
        try:
            # Extract JSON if there's markdown clutter
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            plan_data = json.loads(response_text)
            
            # 4. Save to DB
            daily_plan = DailyPlan(
                user_id=user_id,
                date=date.today(),
                plan=plan_data
            )
            db.add(daily_plan)
            db.commit()
            
            return daily_plan
        except Exception as e:
            print(f"Failed to parse AI plan: {str(e)}")
            return None

