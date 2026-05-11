from sqlalchemy.orm import Session
from datetime import date, timedelta
from models.user import OnboardingProfile
from models.roadmap import RoadmapPhase, PhaseStatus
from services.ai_service import ai_service, AITask
import json

class RoadmapService:
    @staticmethod
    async def generate_roadmap(db: Session, profile: OnboardingProfile):
        start_date = profile.prep_start_date or date.today()
        end_date = profile.target_placement_date
        
        if not end_date:
            end_date = start_date + timedelta(days=180)
            
        total_days = (end_date - start_date).days
        if total_days < 30: total_days = 30
            
        # 1. AI Generation
        system_prompt = "You are a Career Architect. Generate 3 preparation phases for a student based on their profile."
        prompt = f"""
        Student Profile:
        - Target: {profile.target_companies}
        - DSA Level: {profile.dsa_level}
        - ML Level: {profile.ml_level}
        - Skills: {profile.known_languages}
        - Timeline: {total_days} days
        
        Generate 3 phases. Return ONLY JSON:
        [
          {{ "name": "Phase Name", "percent": 0.2, "goals": ["goal 1", "goal 2"] }},
          {{ "name": "Phase Name", "percent": 0.5, "goals": ["goal 1", "goal 2"] }},
          {{ "name": "Phase Name", "percent": 0.3, "goals": ["goal 1", "goal 2"] }}
        ]
        """
        
        response = await ai_service.execute_task(AITask.ROADMAP, prompt, system_prompt)
        try:
            if "```json" in response: response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response: response = response.split("```")[1].split("```")[0].strip()
            phases_data = json.loads(response)
        except:
            # Fallback if AI fails
            phases_data = [
                {"name": "Foundation", "percent": 0.2, "goals": ["DSA Basics", "CS Fundamentals"]},
                {"name": "Core Preparation", "percent": 0.5, "goals": ["Advanced DSA", "Projects"]},
                {"name": "Final Push", "percent": 0.3, "goals": ["Mocks", "Revision"]}
            ]
        
        current_date = start_date
        created_phases = []
        
        for i, p_data in enumerate(phases_data):
            p_days = int(total_days * p_data.get("percent", 0.33))
            p_end_date = current_date + timedelta(days=p_days)
            
            phase = RoadmapPhase(
                user_id=profile.user_id,
                phase_number=i + 1,
                phase_name=p_data["name"],
                start_date=current_date,
                end_date=p_end_date,
                goals={"items": p_data["goals"]},
                status=PhaseStatus.active if i == 0 else PhaseStatus.upcoming
            )
            
            db.add(phase)
            created_phases.append(phase)
            current_date = p_end_date + timedelta(days=1)
            
        db.commit()
        return created_phases

