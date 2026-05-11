import os
import resend
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        resend.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = "PlacementOS <onboarding@resend.dev>" # Use verified domain in prod

    async def send_welcome_email(self, to_email: str, name: str):
        params = {
            "from": self.from_email,
            "to": [to_email],
            "subject": "Welcome to PlacementOS 🚀",
            "html": f"<strong>Hi {name},</strong><p>Your AI-powered career OS is ready. Start by logging your first DSA problem!</p>",
        }
        return resend.Emails.send(params)

    async def send_weekly_report(self, to_email: str, report_text: str):
        params = {
            "from": self.from_email,
            "to": [to_email],
            "subject": "Your Weekly Placement Readiness Report 📊",
            "html": f"<h2>Your Week in Review</h2><p>{report_text}</p>",
        }
        return resend.Emails.send(params)

    async def send_followup_reminder(self, to_email: str, company_name: str):
        params = {
            "from": self.from_email,
            "to": [to_email],
            "subject": f"Time to follow up with {company_name}?",
            "html": f"<p>It's been 7 days since you applied to <strong>{company_name}</strong>. Would you like the AI to draft a follow-up email for you?</p>",
        }
        return resend.Emails.send(params)

email_service = EmailService()
