# Architecture Verification vs Overview Diagram

This document verifies that the repository matches the high-level architecture diagram (Frontends → Backends, inter-backend sync, External, Databases).

---

## 1. Frontends

| Diagram Component | Repository | Status |
|-------------------|------------|--------|
| **Agentdashboard2d3d** → Agent Backend | Submodule `Agentdashboard2d3d/` (React, Agent Dashboard) | ✅ Present. Configure `VITE_AGENT_API_URL` or equivalent to point to Agent Backend (e.g. `http://localhost:8000`). |
| **Useronboarding** → User Onboarding Backend | Submodule `Useronboarding/` (React, Player app) | ✅ Present. Configure API base URL to User Onboarding Backend (e.g. `http://localhost:8001`). |

**Action:** Ensure each frontend’s env (e.g. `.env`) sets the correct backend base URL for the environment.

---

## 2. Backends

| Diagram Component | Repository | Status |
|-------------------|------------|--------|
| **Agent Backend** | `backend-agent/` (FastAPI, port 8000) | ✅ Present. Uses **Agent DB**. |
| **User Onboarding Backend** | `backend-user/` (FastAPI, port 8001) | ✅ Present. Uses **User DB**. |

---

## 3. Inter-Backend Sync

### 3.1 User Onboarding Backend → Agent Backend — “Sync (agent refs, limits)”

| Flow | Implementation | Status |
|------|----------------|--------|
| Agent refs & limits | User backend calls Agent backend internal API | ✅ |
| **Get agent limits / blocked numbers** | `backend-user/app/services/agent_client.py`: `get_agent_limits(agent_id)` → `GET /internal/agents/{agent_id}/limits` | ✅ Used in bets (blocked numbers, limits). |
| **List agents** | `list_agents()` → `GET /internal/agents` | ✅ |
| **Player snapshot sync** | `backend-user/app/services/sync_to_agent.py`: `sync_player_to_agent(player)` → `POST /internal/players` | ✅ Called on register, auth, place_bets, public place_bets. |
| **Deposit request create/list** | User backend → Agent: `POST/GET /internal/deposit-requests` (create on player top-up, list by player_id) | ✅ |

So: **User → Agent** sync covers **agent refs, limits, and player snapshots**.

### 3.2 Agent Backend → User Onboarding Backend — “Sync (players, balance)”

| Flow | Implementation | Status |
|------|----------------|--------|
| **Balance/player credit** | When agent approves a player deposit, Agent backend credits the player in User backend | ✅ |
| **Credit deposit** | `backend-agent/app/services/user_backend_client.py`: `credit_player_deposit()` → User backend `POST /internal/credit-deposit` | ✅ Called from `approve_deposit` in `requests_routes.py`. |

So: **Agent → User** sync covers **balance updates** (and thus “players, balance” in the diagram).

---

## 4. External — “Other platforms” → User Onboarding Backend (“Public API + callbacks”)

| Flow | Implementation | Status |
|------|----------------|--------|
| **Public API** | `backend-user/app/routers/public_api.py` (X-API-Key) | ✅ |
| Create player | `POST /public/players` | ✅ |
| Get balance | `GET /public/players/{player_id}/balance` | ✅ |
| Get history | `GET /public/players/{player_id}/history` | ✅ |
| Place bets | `POST /public/players/{player_id}/bets` | ✅ |
| **Callbacks** | `backend-user/app/services/callbacks.py` | ✅ |
| Events | `bet.placed`, `bet.settled`, `balance.updated` (webhooks to platform `callback_url`) | ✅ |
| Config | `CallbackConfig` per `platform_id` (callback_url, api_key) | ✅ |

**Action:** Set `PUBLIC_API_KEY` in User Backend `.env` when using the public API.

---

## 5. Databases

| Diagram Component | Repository | Status |
|-------------------|------------|--------|
| **Agent DB** | `backend-agent/app/config.py`: `database_url` default `.../agent_db` | ✅ |
| **User DB** | `backend-user/app/config.py`: `database_url` default `.../user_db` | ✅ |

Each backend uses its own DB; no shared DB in the diagram.

---

## 6. Summary Checklist

| Diagram element | Covered |
|-----------------|--------|
| Agentdashboard2d3d → Agent Backend | ✅ (submodule + config) |
| Useronboarding → User Onboarding Backend | ✅ (submodule + config) |
| Agent Backend ↔ User Onboarding Backend sync | ✅ (players, balance, agent refs, limits, deposit flow) |
| Other platforms → User Backend (Public API + callbacks) | ✅ |
| Agent DB (Agent Backend) | ✅ |
| User DB (User Onboarding Backend) | ✅ |

---

## 7. Config Quick Reference

- **User Backend (`.env`):**  
  `AGENT_BACKEND_URL`, `INTERNAL_API_KEY`, `PUBLIC_API_KEY` (for public API), `DATABASE_URL` (user_db).

- **Agent Backend (`.env`):**  
  `USER_BACKEND_URL`, `INTERNAL_API_KEY`, `DATABASE_URL` (agent_db).

- **Frontends:**  
  Point API base URLs to the correct backend (e.g. Useronboarding → User Backend, Agentdashboard2d3d → Agent Backend).

The project **covers** the overview architecture; ensure env vars and backend URLs are set per environment.
