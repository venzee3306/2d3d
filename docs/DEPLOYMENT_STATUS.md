# Deployment Status (MCP)

Summary of what was done via MCP and what you need to do next.

---

## Neon (done)

Two Postgres projects were created and are ready to use:

| Service        | Neon project name | Project ID             | Branch   |
|----------------|-------------------|------------------------|----------|
| Agent backend  | 2d3d-agent        | `fancy-mud-00100579`   | main     |
| User backend   | 2d3d-user         | `small-glade-92007358` | main     |

**Connection strings**

- In [Neon Console](https://console.neon.tech): open each project → **Connection details** → copy the connection string.
- For SQLAlchemy (FastAPI), use **asyncpg**: replace `postgresql://` with `postgresql+asyncpg://` in the URL.
- Your app’s config sanitizes the URL (e.g. for `channel_binding` / `sslmode`), so the Neon default URI is fine.

Use these as `DATABASE_URL` when configuring Render (or any other host) for each backend.

---

## Render (blocked: payment required)

Creating web services via MCP returned **402 – Payment information required**.

**What to do**

1. In [Render Dashboard](https://dashboard.render.com) → **Billing**: add a payment method (free tier may still require a card).
2. Then either:
   - **Option A – Blueprint:** **New** → **Blueprint** → connect repo `venzee3306/2d3d` → apply. Render will create **2d3d-backend-agent** and **2d3d-backend-user** from `render.yaml`.
   - **Option B – Manual:** Create two **Web Services** from the same repo with:
     - **Root directory:** `backend-agent` and `backend-user` respectively.
     - **Build:** `pip install -r requirements.txt`
     - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. For each service, set **Environment** variables as in [DEPLOY.md](./DEPLOY.md#2-deploy-backends-on-render-blueprint) (use the Neon `DATABASE_URL` for that backend, plus `SECRET_KEY`, `INTERNAL_API_KEY`, `USER_BACKEND_URL` / `AGENT_BACKEND_URL`, `CORS_ORIGINS` after frontends are live).

Tables and seed data are created on first run via `init_db()` (no separate migration step).

---

## Vercel (CLI login required)

The Vercel MCP “deploy” step only triggers a deploy; it does not replace the CLI. Deploying the frontends still requires either the dashboard or a logged-in CLI.

**Option A – Vercel Dashboard (recommended)**

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import **venzee3306/2d3d**.
2. **User onboarding app**
   - **Root Directory:** `Useronboarding`
   - **Framework:** Vite
   - **Build:** `npm run build` | **Output:** `dist`
   - Env: `VITE_USER_API_URL` = your User backend URL (e.g. `https://2d3d-backend-user.onrender.com`)
3. **Agent dashboard app**
   - Add another project from the same repo.
   - **Root Directory:** `Agentdashboard2d3d`
   - **Build:** `npm run build` | **Output:** `dist`
   - Env: `VITE_AGENT_API_URL` = your Agent backend URL (e.g. `https://2d3d-backend-agent.onrender.com`)

**Option B – Vercel CLI**

```bash
vercel login   # once per machine
# User onboarding
cd Useronboarding
npx vercel link
npx vercel env add VITE_USER_API_URL   # production value = User backend URL
npx vercel --prod

# Agent dashboard
cd ../Agentdashboard2d3d
npx vercel link
npx vercel env add VITE_AGENT_API_URL  # production value = Agent backend URL
npx vercel --prod
```

**Note:** If the repo only has submodule references, ensure submodules are initialized before building (e.g. in dashboard, use a build command that runs `git submodule update --init --recursive` first, or deploy from a repo that includes the frontend code).

---

## After everything is live

1. Set **CORS_ORIGINS** on both Render backends to your two Vercel frontend URLs (comma-separated).
2. Set **USER_BACKEND_URL** on the Agent service to the User backend URL.
3. Set **AGENT_BACKEND_URL** on the User service to the Agent backend URL (if not already set in Blueprint).

---

## Quick reference

| Resource        | Status   | Next step                                      |
|----------------|----------|------------------------------------------------|
| Neon Agent DB  | Ready    | Copy connection string → use as Agent `DATABASE_URL` |
| Neon User DB   | Ready    | Copy connection string → use as User `DATABASE_URL`  |
| Render backends| 402      | Add payment method → apply Blueprint or create services |
| Vercel frontends| Pending | Dashboard or `vercel login` + CLI deploy from each app dir |
