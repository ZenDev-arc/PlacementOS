import os
import httpx
from dotenv import load_dotenv

load_dotenv()

HF_API_URL = "https://api-inference.huggingface.co/models/"
HF_TOKEN = os.getenv("HF_TOKEN")

class HFService:
    def __init__(self):
        self.headers = {"Authorization": f"Bearer {HF_TOKEN}"}

    async def query(self, model_id: str, payload: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{HF_API_URL}{model_id}", 
                headers=self.headers, 
                json=payload
            )
            return response.json()

    async def extract_skills(self, text: str):
        # Using a model suited for Job/Skill extraction (e.g. JobBERT)
        model_id = "jjzha/jobbert-base-cased"
        payload = {"inputs": text}
        return await self.query(model_id, payload)

    async def get_topic_similarity(self, source_sentence: str, sentences_to_compare: list):
        # Using all-MiniLM-L6-v2 for sentence similarity
        model_id = "sentence-transformers/all-MiniLM-L6-v2"
        payload = {
            "inputs": {
                "source_sentence": source_sentence,
                "sentences": sentences_to_compare
            }
        }
        return await self.query(model_id, payload)

    async def analyze_sentiment(self, text: str):
        # Using RoBERTa for sentiment
        model_id = "cardiffnlp/twitter-roberta-base-sentiment"
        payload = {"inputs": text}
        return await self.query(model_id, payload)

hf_service = HFService()
