import os
import enum
from typing import Optional, Dict, Any
from groq import Groq
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load .env from the backend root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class AITask(str, enum.Enum):
    TEACHING = "teaching"
    INTERVIEW_PREP = "interview_prep"
    WEEKLY_REPORT = "weekly_report"
    WEAK_AREA_ANALYSIS = "weak_area_analysis"
    PLAN_GENERATION = "plan_generation"
    EMAIL_DRAFT = "email_draft"
    REFERRAL_MESSAGE = "referral_message"
    JD_PARSING = "jd_parsing"
    RESUME_REVIEW = "resume_review"
    JD_MATCHING = "jd_matching"
    ROADMAP = "roadmap"

MODEL_CONFIG = {
    AITask.TEACHING:           {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
    AITask.INTERVIEW_PREP:     {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
    AITask.WEEKLY_REPORT:      {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
    AITask.WEAK_AREA_ANALYSIS: {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
    AITask.PLAN_GENERATION:    {"provider": "groq",   "model": "llama-3.1-8b-instant"},
    AITask.EMAIL_DRAFT:        {"provider": "groq",   "model": "llama-3.1-8b-instant"},
    AITask.REFERRAL_MESSAGE:   {"provider": "groq",   "model": "llama-3.1-8b-instant"},
    AITask.JD_PARSING:         {"provider": "gemini", "model": "gemini-1.5-flash"},
    AITask.RESUME_REVIEW:      {"provider": "gemini", "model": "gemini-1.5-flash"},
    AITask.JD_MATCHING:        {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
    AITask.ROADMAP:            {"provider": "groq",   "model": "llama-3.3-70b-versatile"},
}

import asyncio

class AIService:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        if self.groq_key:
            from groq import Groq
            self.groq_client = Groq(api_key=self.groq_key)
        else:
            print("WARNING: GROQ_API_KEY not found. Running AI Service in Mock Mode.")
            self.groq_client = None

        if self.gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            print("WARNING: GEMINI_API_KEY not found. Running AI Service in Mock Mode.")
            self.gemini_model = None

    async def execute_task(self, task: AITask, prompt: str, system_prompt: Optional[str] = None) -> str:
        config = MODEL_CONFIG.get(task)
        if not config:
            return "Error: Invalid task configuration."
        
        try:
            if config["provider"] == "groq":
                return await self._call_groq(config["model"], prompt, system_prompt)
            elif config["provider"] == "gemini":
                return await self._call_gemini(config["model"], prompt, system_prompt)
            return "Error: Unknown AI provider."
        except Exception as e:
            print(f"AI Provider Error ({config['provider']}): {str(e)}")
            return f"Error: AI service unavailable. {str(e)}"

    async def _call_groq(self, model: str, prompt: str, system_prompt: Optional[str]) -> str:
        if not self.groq_client:
            return "Error: Groq is not configured. Please check your API keys."
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        print(f"DEBUG: Executing Groq task on thread pool ({model})...")
        def sync_call():
            return self.groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
            )
        
        completion = await asyncio.to_thread(sync_call)
        return completion.choices[0].message.content

    async def _call_gemini(self, model: str, prompt: str, system_prompt: Optional[str]) -> str:
        if not self.gemini_model:
            return "Error: Gemini is not configured. Please check your API keys."
            
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        print(f"DEBUG: Executing Gemini task on thread pool...")
        def sync_call():
            try:
                response = self.gemini_model.generate_content(full_prompt)
                if not response or not hasattr(response, 'candidates') or not response.candidates:
                    return "Error: Gemini returned an empty response (possibly blocked by safety filters)."
                return response.text
            except Exception as e:
                return f"Error calling Gemini: {str(e)}"
            
        return await asyncio.to_thread(sync_call)

ai_service = AIService()
