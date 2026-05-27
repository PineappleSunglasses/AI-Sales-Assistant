# AI Summer Challenge Group 5

AI-based budget planning assistant for Rohde & Schwarz Case 1.

The project is structured as a production-ready prototype:

- `frontend/`: Next.js + React + TypeScript user interface
- `backend/`: FastAPI backend for uploads, parsing, validation, agents, and exports
- `agents/`: role definitions for the AI-assisted budget workflow
- `docs/`: case material, architecture notes, and extracted customer requirements
- `data/`: raw customer inputs, templates, and sample/demo data

## Target Workflow

Upload budget Excel files and planning premises, normalize the data into a
database, run deterministic validation and AI-assisted proposal generation, then
review flagged inconsistencies in a dashboard and export validated budget files.

## Recommended Stack

- Frontend: Next.js, React, TypeScript, TanStack Table, ECharts/Recharts
- Backend: Python, FastAPI, pandas, openpyxl
- Database: PostgreSQL, SQLAlchemy, Alembic
- Background jobs: Redis with Celery or RQ
- AI layer: structured agent outputs behind backend services
