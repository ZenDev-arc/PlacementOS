# PlacementOS

> **Repository description:** PlacementOS is an AI-powered career preparation operating system that helps students manage placements, internships, interview prep, and skill growth in one unified workspace.

![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Docker](https://img.shields.io/badge/Dev-Docker-2496ED?logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)

PlacementOS combines planning, execution, and AI guidance so students can move from **"I should prepare"** to **consistent outcomes**.

## ✨ Highlights

- Personalized placement-prep dashboard
- DSA tracking with weak-topic visibility
- Internship/application pipeline overview
- AI mentor response contracts and scalable backend structure

## 🧱 Repository Structure

- `frontend/` — Next.js App Router UI (dashboard + workflows)
- `backend/` — FastAPI services with versioned APIs
- `docker-compose.yml` — Local stack (Postgres, Redis, Qdrant, backend, frontend)
- `.github/workflows/ci.yml` — Baseline CI checks

## 🚀 Quick Start

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
# Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend docs: `http://localhost:8000/docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: `http://localhost:3000`

### 3) Full stack with Docker

```bash
docker compose up --build
```

## 🔐 Environment Setup

Copy the example env files and fill real values:

- `backend/.env.example`
- `frontend/.env.example`

> Never commit live credentials or API keys.

## 🗺️ Product Direction

1. Strengthen persistence with robust PostgreSQL models and migrations.
2. Add complete authentication and protected user workspaces.
3. Replace sample analytics with SQL-backed aggregates.
4. Expand AI orchestration with provider abstraction and workflow supervision.
5. Extend resume parsing, RAG ingestion, and interview simulation flows.
