# Backend

FastAPI service for file upload, Excel ingestion, validation, agent orchestration,
database persistence, and export generation.

## Planned Modules

- `api`: HTTP routes
- `core`: configuration and shared app setup
- `db`: database session and models
- `ingestion`: Excel/PDF/DOCX parsing
- `validation`: deterministic rules and scoring
- `agents`: structured AI-assisted proposal generation
- `exports`: reviewed Excel/report exports

## Local Development

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .[dev]
uvicorn app.main:app --reload
```
