# Technical Stack Recommendation

## Product Shape

The solution is a budget-planning validation platform. It ingests submitted ISO
Excel files, confidential business-plan targets, and planning rules, then
normalizes, validates, flags, proposes corrections, and exports reviewed data.

## Frontend

- Next.js with React and TypeScript
- TanStack Table for large review tables
- ECharts or Recharts for dashboards, heatmaps, and trend views
- shadcn/ui or a similar component system for fast, consistent UI

## Backend

- FastAPI for API endpoints and OpenAPI documentation
- pandas and openpyxl for Excel ingestion
- pypdf and python-docx for extracting planning context from customer documents
- Pydantic for strict request, response, and agent-output schemas

## Database

- PostgreSQL as the system of record
- SQLAlchemy 2.0 for ORM models
- Alembic for migrations
- JSONB only for flexible metadata, extracted document snippets, or rule payloads

## Background Jobs

- Redis plus Celery or RQ
- Use background jobs for workbook parsing, validation runs, AI proposal
  generation, and Excel export.

## AI Layer

Agents should support deterministic business logic rather than replace it.
Use structured JSON outputs for correction proposals, rationale, and confidence.

Core agents:

- IngestionAgent
- NormalizationAgent
- ValidationAgent
- ProposalAgent
- ReviewAgent
- ExportAgent
