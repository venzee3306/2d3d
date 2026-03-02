# Deploy 2D3D for free (test)

Use free tiers of **Neon** (PostgreSQL), **Render** (backends), and **Vercel** (frontends). All have no-cost plans suitable for testing.

---

## 1. Databases (Neon – free)

1. Sign up at [neon.tech](https://neon.tech).
2. Create **two** projects (or two databases in one project):
   - **agent_db** – for Agent Dashboard backend
   - **user_db** – for User Onboarding backend
3. In each project, open **Connection details** and copy the connection string.
4. Neon gives a **pooled** URL (e.g. `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`). For async Python (asyncpg) use the **same URL** but with scheme `postgresql+asyncpg`:
   - `postgresql+asyncpg://user:pass@ep-xxx.../neondb?sslmode=require`

---

## 2. Backends (Render – free)

1. Sign up at [render.com](https://render.com).
2. Push your repo to **GitHub** (or GitLab) if you haven’t already.

### Agent backend

1. **New → Web Service**.
2. Connect the repo, set:
   - **Root directory:** `backend-agent`
   - **Runtime:** Python 3
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment:**
   - `DATABASE_URL` = your Neon **agent_db** URL (with `postgresql+asyncpg://...`)
   - `SECRET_KEY` = a long random string (e.g. `openssl rand -hex 32`)
   - `USER_BACKEND_URL` = (set after User backend is deployed, e.g. `https://your-user-backend.onrender.com`)
   - `INTERNAL_API_KEY` = same shared secret you’ll set on the User backend
   - `CORS_ORIGINS` = your Agent Dashboard frontend URL, e.g. `https://agentdashboard-xxx.vercel.app` (add after Vercel deploy)
   - `COOKIE_SECURE` = `true`
4. Deploy. Note the URL (e.g. `https://backend-agent-xxx.onrender.com`).

### User backend

1. **New → Web Service**.
2. Same repo:
   - **Root directory:** `backend-user`
   - **Build:** `pip install -r requirements.txt`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment:**
   - `DATABASE_URL` = Neon **user_db** URL (with `postgresql+asyncpg://...`)
   - `SECRET_KEY` = a long random string
   - `AGENT_BACKEND_URL` = your Agent backend URL (e.g. `https://backend-agent-xxx.onrender.com`)
   - `INTERNAL_API_KEY` = same as on Agent backend
   - `DEFAULT_AGENT_ID` = the admin user id from Agent DB (e.g. `admin1` after first run, or create via Agent API)
   - `PUBLIC_API_KEY` = optional; set if you use the public API
   - `CORS_ORIGINS` = your User Onboarding frontend URL, e.g. `https://useronboarding-xxx.vercel.app`
   - `COOKIE_SECURE` = `true`
4. Deploy. Note the URL (e.g. `https://backend-user-xxx.onrender.com`).

Then in **Agent backend** env, set `USER_BACKEND_URL` to this User backend URL and redeploy if you set it to a placeholder before.

**Render free tier:** services sleep after ~15 min inactivity; first request after sleep can take 30–60 s.

---

## 3. Frontends (Vercel – free)

**Submodules:** The Dashboard and User onboarding apps are Git submodules. After cloning the main repo, run:

```bash
git submodule update --init --recursive
```

to populate `Agentdashboard2d3d/` and `Useronboarding/`. Submodule URLs: `git@github.com:venzee3306/Agentdashboard2d3d.git`, `git@github.com:venzee3306/Useronboarding.git`.

1. Sign up at [vercel.com](https://vercel.com) and import your repo.

**Proceed (pick one):**

- **Option A – Dashboard:** [vercel.com/new](https://vercel.com/new) → Import **venzee3306/2d3d** twice. First project: root **Useronboarding**, env `VITE_USER_API_URL` = your User backend URL. Second project: root **Agentdashboard2d3d**, env `VITE_AGENT_API_URL` = your Agent backend URL. Deploy both, then set those URLs in Render **CORS_ORIGINS**.
- **Option B – CLI:** Run once `vercel login`, then from repo root: `./scripts/deploy-vercel.sh`. Or with a token: `VERCEL_TOKEN=your_token ./scripts/deploy-vercel.sh` ([create token](https://vercel.com/account/tokens)). After deploy, set the two frontend URLs in Render **CORS_ORIGINS** and in each Vercel project set the `VITE_*_API_URL` env vars to your Render backend URLs.

### User Onboarding app

1. **Add New Project** → same repo.
2. **Root directory:** set to `Useronboarding`.
3. **Build command:** `npm run build` (or `pnpm build` if you use pnpm).
4. **Output directory:** `dist` (Vite default).
5. **Environment variables:**
   - `VITE_USER_API_URL` = your User backend URL (e.g. `https://backend-user-xxx.onrender.com`)
6. Deploy. Note the URL (e.g. `https://useronboarding-xxx.vercel.app`).

### Agent Dashboard app

1. **Add New Project** again for the same repo (or use a second project).
2. **Root directory:** `Agentdashboard2d3d`.
3. **Build:** `npm run build` (or `pnpm build`).
4. **Output directory:** `dist`.
5. **Environment variables:**
   - `VITE_AGENT_API_URL` = your Agent backend URL (e.g. `https://backend-agent-xxx.onrender.com`)
6. Deploy. Note the URL (e.g. `https://agentdashboard-xxx.vercel.app`).

---

## 4. Live URLs (custom domains)

| App | URL |
|-----|-----|
| **Dashboard (Agent)** | https://2d3d-eonb.milliontechsteps.com/ |
| **User onboarding** | https://2d3d-pi.milliontechsteps.com/ |

**On both Render backends**, set **CORS_ORIGINS** to (comma-separated, no trailing slashes):

```
https://2d3d-eonb.milliontechsteps.com,https://2d3d-pi.milliontechsteps.com
```

**Build env for each frontend** (Vercel/host):  
- Dashboard project: `VITE_AGENT_API_URL` = your Agent backend URL (e.g. `https://twod3d-backend-agent.onrender.com`).  
- User project: `VITE_USER_API_URL` = your User backend URL (e.g. `https://twod3d-backend-user.onrender.com`).

---

## 5. Cookies and CORS (cross-origin)

- Frontends and backends are on **different origins**, so the browser sends cookies only if:
  - Backends use **HTTPS** (Render does).
  - You set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` for cross-site cookies, **or** you keep `SameSite=Lax` and accept that cookies are sent only when the user opens your app from the same site (e.g. links from the same Vercel domain).
- For **same-site**: if you put both frontends under one Vercel project (e.g. `yourapp.vercel.app` and `yourapp-agent.vercel.app`), Lax is usually enough.
- **CORS with cookies:** Browsers do not allow `Access-Control-Allow-Origin: *` when credentials (cookies) are sent. Set on **both backends**:
  - `CORS_ORIGINS` = your frontend URLs, comma-separated, e.g. `https://useronboarding-xxx.vercel.app,https://agentdashboard-xxx.vercel.app`
  - If unset, the app falls back to `*` (works for same-origin or when not using cookies).
- If login or session still fails:
  - Set on both backends: `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true`.

---

## 6. Quick reference

| What        | Service | Free tier |
|------------|---------|-----------|
| PostgreSQL | Neon    | 0.5 GB, 1 project (use 2 DBs or 2 projects) |
| Backends   | Render  | 750 h/month per service, sleep when idle |
| Frontends  | Vercel  | Hobby: unlimited static/SSR, 100 GB bandwidth |

**Optional alternatives**

- **DB:** Supabase (free Postgres), Railway (free credit), or ElephantSQL.
- **Backends:** Railway ($5 free credit/month), Fly.io (free allowance), or Koyeb.
- **Frontends:** Netlify or Cloudflare Pages instead of Vercel.

---

## 7. Neon, Render, and Vercel MCP (deploy from Cursor)

You can manage Neon (databases), Render (backends), and Vercel (frontends) from Cursor using their official MCP servers. Once configured, you can use natural language to create projects, run SQL, deploy services, and view logs.

### Neon MCP (databases)

- **Docs:** [neon.tech/docs/ai/neon-mcp-server](https://neon.tech/docs/ai/neon-mcp-server)
- **Endpoint:** `https://mcp.neon.tech/mcp` (hosted; OAuth or API key)

**Setup in Cursor**

**Option A – OAuth (no API key):**

```bash
npx add-mcp https://mcp.neon.tech/mcp
```

Or add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "neon": {
      "type": "http",
      "url": "https://mcp.neon.tech/mcp"
    }
  }
}
```

Restart Cursor; when you use Neon tools, an OAuth window opens to authorize your Neon account.

**Option B – API key:** Get a [Neon API key](https://neon.tech/docs/manage/api-keys), then:

```bash
npx add-mcp https://mcp.neon.tech/mcp --header "Authorization: Bearer $NEON_API_KEY"
```

Or in config, add `"headers": { "Authorization": "Bearer <NEON_API_KEY>" }` to the `neon` server.

**What you can do**

- List/create projects, branches, databases; get connection strings.
- Run SQL (`run_sql`, `run_sql_transaction`), list tables, describe schema.
- Branch-based migrations (`prepare_database_migration`, `complete_database_migration`).
- Query tuning, explain SQL, list slow queries (with pg_stat_statements).
- Search across projects/branches; fetch Neon docs.

**Read-only mode:** Add header `"x-read-only": "true"` to restrict to read-only tools and read-only SQL.

**Security:** Neon recommends using MCP for local/dev only; review and approve actions before execution.

---

### Render MCP

- **Docs:** [render.com/docs/mcp-server](https://render.com/docs/mcp-server)
- **Endpoint:** `https://mcp.render.com/mcp` (hosted by Render; auth via API key)

**Setup in Cursor**

1. Create an API key: [Render Dashboard → Account Settings → API Keys](https://dashboard.render.com/settings#api-keys).
2. Add to your MCP config (project: `.cursor/mcp.json` or user: `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_RENDER_API_KEY>"
      }
    }
  }
}
```

Replace `<YOUR_RENDER_API_KEY>` with your key. Restart Cursor (or reload MCP).

**What you can do**

- Set your workspace: e.g. *“Set my Render workspace to [name]”*.
- Create web services, Postgres, static sites, cron jobs.
- List services, view deploy history, pull logs, fetch metrics.
- Update a service’s environment variables (only destructive operation supported).
- Run read-only SQL on Render Postgres.

Render MCP does **not** trigger deploys, delete resources, or change scaling; use the dashboard or API for that.

---

### Vercel MCP

- **Docs:** [vercel.com/docs/mcp/vercel-mcp](https://vercel.com/docs/mcp/vercel-mcp)
- **Endpoint:** `https://mcp.vercel.com` (OAuth; no API key in config)

**Setup in Cursor**

1. Add the server. Either run:
   ```bash
   npx add-mcp https://mcp.vercel.com
   ```
   or add this to `.cursor/mcp.json` (merge with existing `mcpServers` if needed):

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

2. Restart Cursor. When you use Vercel tools, Cursor will show **“Needs login”** — click it and complete the Vercel OAuth in the browser.

**What you can do**

- Manage projects and deployments.
- View deployment logs.
- Search Vercel docs.
- For a specific project, use a project-scoped URL: `https://mcp.vercel.com/<team-slug>/<project-slug>` (see [Vercel MCP docs](https://vercel.com/docs/mcp/vercel-mcp#project-specific-mcp-access)).

---

### Using all three for 2D3D

- **Neon MCP:** Create the two Neon projects (agent_db, user_db), get connection strings, run SQL or migrations, and inspect schema. Use those URLs as `DATABASE_URL` in Render.
- **Render MCP:** Create and manage the two backends (Agent + User), create Render Postgres if you use it instead of Neon, set `DATABASE_URL`, `CORS_ORIGINS`, etc., and pull logs when debugging.
- **Vercel MCP:** Create/link the two frontend projects (User Onboarding + Agent Dashboard), deploy, and view build/deploy logs.

You can still follow the manual steps in this doc; the MCPs let you do the same from Cursor with prompts like “Create a web service for backend-user from this repo” or “Show the latest deploy logs for my User Onboarding project.”

---

## 8. After deploy

- **Agent backend:** open `https://your-agent-backend.onrender.com/docs` and log in (e.g. admin / admin123 if you seeded that user).
- **User backend:** open `https://your-user-backend.onrender.com/docs` to try the API.
- **User Onboarding:** open the Vercel URL, register or log in, place bets.
- **Agent Dashboard:** open the Vercel URL, log in with an agent user, manage balances and requests.

If something fails, check Render logs (backend) and browser DevTools (Network + Console) and the notes in **section 4** about cookies and CORS. With **Render MCP** you can pull logs from Cursor; with **Vercel MCP** you can inspect deployment logs from Cursor.
