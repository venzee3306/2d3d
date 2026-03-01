# Backend Services (2D3D)

Two FastAPI backends: **Agent Dashboard** and **User Onboarding**, with separate DBs and sync between them.

## Quick start

### Agent Dashboard Backend (port 8000)

```bash
cd backend-agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL (PostgreSQL), SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  
- Seed: default admin `admin` / `admin123` if DB is empty.

### User Onboarding Backend (port 8001)

```bash
cd backend-user
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL, AGENT_BACKEND_URL, SECRET_KEY, optional DEFAULT_AGENT_ID
uvicorn app.main:app --reload --port 8001
```

- Docs: http://localhost:8001/docs  
- Health: http://localhost:8001/health  

### Frontends

- **Agent Dashboard**: set `VITE_AGENT_API_URL=http://localhost:8000` (see `Agentdashboard2d3d/.env.example`).
- **User Onboarding**: set `VITE_USER_API_URL=http://localhost:8001` (see `Useronboarding/.env.example`).

API clients are in `Agentdashboard2d3d/src/app/api/client.ts` and `Useronboarding/src/app/api/client.ts`.

## Architecture

- **Agent Backend**: users (admin/master/agent), hierarchy, balances, deposit/withdrawal/unit requests, player snapshots (synced from User Backend).
- **User Backend**: players, sessions, bets, transactions; syncs player snapshot to Agent Backend on register and after bets; calls Agent Backend for agent limits and blocked numbers when placing bets.
- **Public API** (User Backend): `X-API-Key` auth; create player, place bet, balance, history; optional webhook callbacks (set `PUBLIC_API_KEY` in `.env`).
- **Default dashboard**: when `player.source === 'api'`, the User Onboarding UI can show a “Default dashboard” experience.
