import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Add current directory to path so we can import db
sys.path.append(os.getcwd())

load_dotenv()
url = os.getenv("DATABASE_URL")
if not url:
    print("DATABASE_URL not found in .env")
    sys.exit(1)

engine = create_engine(url)

with engine.connect() as conn:
    print("Dropping habits and habit_logs tables...")
    conn.execute(text("DROP TABLE IF EXISTS habit_logs CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS habits CASCADE"))
    conn.commit()
    print("Tables dropped successfully. They will be recreated correctly on next backend startup.")
