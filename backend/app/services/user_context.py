from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import User

DEMO_EMAIL = "demo@placementos.local"


def get_demo_user(db: Session) -> User:
    user = db.scalar(select(User).where(User.email == DEMO_EMAIL))
    if user is not None:
        return user

    user = User(email=DEMO_EMAIL, full_name="Student")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
