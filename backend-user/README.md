# User Onboarding Backend

FastAPI backend for the User Onboarding portal (players, bets, sessions).

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env         # edit DATABASE_URL, AGENT_BACKEND_URL, SECRET_KEY
```

## Run

```bash
uvicorn app.main:app --reload --port 8001
# or: python -m app.main
```

- API: http://localhost:8001
- Docs: http://localhost:8001/docs
- Health: http://localhost:8001/health
