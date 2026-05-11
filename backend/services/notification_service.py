import firebase_admin
from firebase_admin import messaging, credentials
import os
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class NotificationService:
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NotificationService, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        if self._initialized:
            return
        
        cert_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if cert_path and os.path.exists(cert_path):
            try:
                cred = credentials.Certificate(cert_path)
                firebase_admin.initialize_app(cred)
                self._initialized = True
                logger.info("Firebase Admin initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase Admin: {e}")
        else:
            logger.warning("FIREBASE_SERVICE_ACCOUNT_PATH not found or invalid. Push notifications disabled.")

    async def send_to_token(self, token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
        if not self._initialized:
            logger.error("NotificationService not initialized.")
            return False

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data,
            token=token,
        )

        try:
            response = messaging.send(message)
            logger.info(f"Successfully sent message: {response}")
            return True
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return False

    async def send_to_user(self, db, user_id, title, body, data=None):
        from models.user import DeviceToken
        tokens = db.query(DeviceToken).filter(DeviceToken.user_id == user_id).all()
        
        success = False
        for dt in tokens:
            if await self.send_to_token(dt.token, title, body, data):
                success = True
        return success

notification_service = NotificationService()
