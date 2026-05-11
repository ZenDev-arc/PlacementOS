# AI Layer

This folder is reserved for the LangGraph-based multi-agent system.

Planned modules:

- `agents/supervisor` - routes user goals to specialized agents
- `agents/study_planner` - builds daily and weekly plans
- `agents/dsa_agent` - recommends problems and revisions
- `agents/resume_agent` - scores and improves resumes
- `agents/interview_agent` - runs mock interviews
- `memory` - Redis, PostgreSQL, and Qdrant memory adapters
- `tools` - typed tool interfaces backed by FastAPI services
