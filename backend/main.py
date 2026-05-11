from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.v1.router import api_router
from db.session import engine, Base
import models  # Import all models to register them with Base.metadata
from services.notification_service import notification_service
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    try:
        print("Initializing database...")
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully.")
        notification_service.initialize()
    except Exception as e:
        print(f"CRITICAL: Could not connect to database: {e}")
        print("Starting in degraded mode (DB operations will fail).")
    yield

app = FastAPI(
    title="PlacementOS API",
    description="AI-powered career preparation OS",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=True
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development troubleshooting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to PlacementOS API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

