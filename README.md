# PlacementOS

AI-powered career preparation operating system for students preparing for placements, internships, interviews, and technical careers.

## What Is Included

- `frontend/` - Next.js App Router dashboard foundation
- `backend/` - FastAPI service with versioned REST APIs
- `docker-compose.yml` - local Postgres, Redis, Qdrant, backend, and frontend
- `.github/workflows/ci.yml` - starter CI for backend and frontend checks

## First Product Slice

This scaffold focuses on the first useful vertical:

- preparation dashboard snapshot
- DSA progress and weak-topic insights
- internship/application pipeline overview
- AI mentor response contract
- production-shaped folders for future auth, analytics, RAG, and agents

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

### Full Stack With Docker

```bash
docker compose up --build
```

## Environment

Copy `.env.example` files and fill real secrets when needed:

- `backend/.env.example`
- `frontend/.env.example`

Do not commit live API keys.

## Roadmap

1. Add real persistence with PostgreSQL models and migrations.
2. Add authentication and protected user workspaces.
3. Replace sample analytics with SQL-backed aggregates.
4. Add AI provider abstraction and LangGraph supervisor workflow.
5. Add resume parser, RAG ingestion, and interview simulator flows.
