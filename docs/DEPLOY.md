# Deploy 2D3D (Render + Vercel)

Deploy both backends to **Render** and both frontends to **Vercel**. Use **Neon** (or Render Postgres) for the two databases.

**Current MCP status:** Neon projects are created and ready. See [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) for Neon project IDs, Render (402 / payment) and Vercel (CLI login) next steps.

---

## Prerequisites

- Code pushed to **GitHub**: `https://github.com/venzee3306/2d3d`
- **Neon**: Two Postgres databases (one for Agent backend, one for User backend), or use Render Postgres.
- **Render** and **Vercel** accounts connected to the repo.

---

## 1. Databases (Neon or Render Postgres)

Create two Postgres databases and note the connection strings (use **asyncpg**-compatible URL, e.g. `postgresql+asyncpg://...` for SQLAlchemy).

- **Agent DB** → for `2d3d-backend-agent` (`DATABASE_URL`)
- **User DB** → for `2d3d-backend-user` (`DATABASE_URL`)

If using **Neon**: create two projects or two databases, copy the connection strings. If using **Render**: create two Postgres instances from the Render dashboard.

---

## 2. Deploy backends on Render (Blueprint)

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect **GitHub** and select the repo **venzee3306/2d3d**.
3. Render reads `render.yaml` and creates:

**Important:** Both backends are **FastAPI** (ASGI). Use **uvicorn**, not gunicorn/WSGI. If you create services manually or Render shows a default, set:

| Field | Value |
|-------|--------|
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

(Render may suggest `gunicorn your_application.wsgi` — ignore that; these apps use uvicorn.)

4. After Blueprint creates the services:
   - **2d3d-backend-agent** (Python, `backend-agent/`)
   - **2d3d-backend-user** (Python, `backend-user/`)

5. For each service, set **Environment** variables:

   **2d3d-backend-agent**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Your Agent DB connection string (postgresql+asyncpg://...) |
   | `SECRET_KEY` | Random secret (e.g. `openssl rand -hex 32`) |
   | `INTERNAL_API_KEY` | Shared secret between the two backends (same value on both) |
   | `USER_BACKEND_URL` | `https://2d3d-backend-user.onrender.com` *(set after User backend is live)* |
   | `CORS_ORIGINS` | Your Vercel frontend URLs, comma-separated *(set after frontends deploy)* |

   **2d3d-backend-user**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Your User DB connection string (postgresql+asyncpg://...) |
   | `SECRET_KEY` | Random secret |
   | `INTERNAL_API_KEY` | Same value as on Agent backend |
   | `AGENT_BACKEND_URL` | `https://2d3d-backend-agent.onrender.com` |
   | `DEFAULT_AGENT_ID` | e.g. `admin1` (first admin user id in Agent DB after seed) |
   | `CORS_ORIGINS` | Your Vercel frontend URLs, comma-separated |

6. Save and let Render build and deploy. Note the service URLs (e.g. `https://2d3d-backend-agent.onrender.com`, `https://2d3d-backend-user.onrender.com`).
7. Set **USER_BACKEND_URL** on the Agent service to the User backend URL if not already set.

---

## 3. Deploy frontends on Vercel

You have two projects (**2d3d**, **2d3d-eonb**) from the monorepo. For correct builds with submodules, follow **[docs/VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** to set each project’s Build Command and Output Directory. Summary: build from repo root using `scripts/vercel-build.sh <Useronboarding|Agentdashboard2d3d>` and set Output to the app’s `dist` folder.

### Option A: Vercel Dashboard (recommended)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → Import **venzee3306/2d3d**.

2. **First project – User Onboarding**
   - **Root Directory**: `Useronboarding`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment variable**: `VITE_USER_API_URL` = `https://2d3d-backend-user.onrender.com` (or your User backend URL)
   - Deploy. Note the URL (e.g. `https://2d3d-user.vercel.app`).

3. **Second project – Agent Dashboard**
   - Add another project from the same repo.
   - **Root Directory**: `Agentdashboard2d3d`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment variable**: `VITE_AGENT_API_URL` = `https://2d3d-backend-agent.onrender.com`
   - Deploy. Note the URL.

### Option B: Vercel CLI

```bash
# User Onboarding
cd Useronboarding
npm install
npx vercel link   # link to a new or existing project, set root to .
npx vercel env add VITE_USER_API_URL   # production: https://2d3d-backend-user.onrender.com
npx vercel --prod

# Agent Dashboard (from repo root)
cd ../Agentdashboard2d3d
npm install
npx vercel link
npx vercel env add VITE_AGENT_API_URL  # production: https://2d3d-backend-agent.onrender.com
npx vercel --prod
```

---

## 4. Wire CORS and backend URLs

1. In **Render** → **2d3d-backend-agent** → Environment: set **CORS_ORIGINS** to your two Vercel frontend URLs (comma-separated).
2. In **Render** → **2d3d-backend-user** → Environment: set **CORS_ORIGINS** to the same two URLs.
3. Save so both backends redeploy with the new CORS settings.

---

## 5. Seed Agent database (optional)

If the Agent backend uses a seed (e.g. creates an admin user), run migrations and seed via Render shell or a one-off job, or call an init endpoint if you have one. Ensure at least one admin user exists so you can log in to the Agent Dashboard.

---

## 6. Done

- **User (player) app**: `https://<your-user-frontend>.vercel.app` → login/register, place bets.
- **Agent dashboard**: `https://<your-agent-frontend>.vercel.app` → login (e.g. admin / your-seed-password).
- **APIs**:  
  - Agent: `https://2d3d-backend-agent.onrender.com/docs`  
  - User: `https://2d3d-backend-user.onrender.com/docs`

---

## Render MCP (optional)

If you use Cursor with Render MCP:

1. Add your **Render API key** to `.cursor/mcp.json` (see [docs/MCP_SETUP.md](./MCP_SETUP.md)).
2. In Render, select the **workspace** you want to use (MCP will use it for operations).
3. You can create services via MCP or continue using the Blueprint (render.yaml) from the dashboard.

## Troubleshooting

- **Build fails on Render**: Check that `rootDir` in `render.yaml` is `backend-agent` and `backend-user` and that `pip install -r requirements.txt` runs in that directory.
- **CORS errors**: Ensure **CORS_ORIGINS** on both backends includes the exact Vercel URLs (with `https://`, no trailing slash).
- **401/403 between backends**: Ensure **INTERNAL_API_KEY** is identical on both backends and **AGENT_BACKEND_URL** / **USER_BACKEND_URL** are correct.
