# Deploy 2D3D — proceed checklist

Use this in order. Env values (DB URLs, etc.) are in **DEPLOY_ENV_EXAMPLE.md** (local only; do not commit).

**Repo:** https://github.com/venzee3306/2d3d

---

## Step 1 — Push to GitHub *(done)*

**Option A — One command (uses your GitHub token):**

In a terminal (use the same token you use for GitHub MCP, with `repo` scope):

```bash
cd /home/venzee-lom/Desktop/work-space/2d3d
export GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here
./scripts/deploy-to-github.sh
```

This creates the `2d3d` repo under your account and pushes `main`. Done: `https://github.com/YOUR_USERNAME/2d3d`

**Option B — Manual:** Create repo [github.com/new](https://github.com/new) named `2d3d` (public, no README), then:

```bash
cd /home/venzee-lom/Desktop/work-space/2d3d
git remote add origin https://github.com/YOUR_USERNAME/2d3d.git
git push -u origin main
```

---

## Step 2 — Deploy backends on Render *(services created via MCP)*

**Done:** Both services exist. Set **Root Directory** so builds succeed:

1. [2d3d-backend-agent](https://dashboard.render.com/web/srv-d6ia7mv5r7bs73fda170/settings) → **Build & Deploy** → **Root Directory** → `backend-agent` → Save. Then **Manual Deploy** → **Deploy latest commit**.
2. [2d3d-backend-user](https://dashboard.render.com/web/srv-d6ia7ppdrdic73edssq0/settings) → **Root Directory** → `backend-user` → Save → **Manual Deploy**.

**URLs:** Agent: https://twod3d-backend-agent.onrender.com | User: https://twod3d-backend-user.onrender.com

*(Optional)* To use Blueprint instead next time:
1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect GitHub and select the **2d3d** repo.
3. Render will create **2d3d-backend-agent** and **2d3d-backend-user** from `render.yaml`.
4. In each service → **Environment**, set (from **DEPLOY_ENV_EXAMPLE.md**):
   - **2d3d-backend-agent:** `DATABASE_URL` (Agent DB), `SECRET_KEY`, `INTERNAL_API_KEY`, `COOKIE_SECURE=true`. Leave `USER_BACKEND_URL` and `CORS_ORIGINS` empty for now.
   - **2d3d-backend-user:** `DATABASE_URL` (User DB), `SECRET_KEY`, `INTERNAL_API_KEY`, `DEFAULT_AGENT_ID=admin1`, `COOKIE_SECURE=true`. Set `AGENT_BACKEND_URL=https://2d3d-backend-agent.onrender.com` (or your Agent URL). Leave `CORS_ORIGINS` empty for now.
5. Save and wait for both to deploy. Note the URLs (e.g. `https://2d3d-backend-agent.onrender.com`, `https://2d3d-backend-user.onrender.com`).
6. On **2d3d-backend-agent**, set `USER_BACKEND_URL` to the User backend URL, then save.

---

## Step 3 — Deploy frontends on Vercel

**Option A — CLI (after one-time login):** Run `vercel login` once, then:

```bash
cd /home/venzee-lom/Desktop/work-space/2d3d
./scripts/deploy-vercel.sh
```

Then in Vercel dashboard set env vars for each project: `VITE_USER_API_URL` and `VITE_AGENT_API_URL` to your backend URLs.

**Option B — Dashboard:**

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import **2d3d** repo.
2. **First project — User Onboarding**
   - Root Directory: **Useronboarding**
   - Build: `npm run build`
   - Env: `VITE_USER_API_URL` = your User backend URL (e.g. `https://2d3d-backend-user.onrender.com`)
   - Deploy → copy the app URL (e.g. `https://2d3d-user.vercel.app`).
3. **Second project — Agent Dashboard**
   - Add another project from the same repo.
   - Root Directory: **Agentdashboard2d3d**
   - Build: `npm run build`
   - Env: `VITE_AGENT_API_URL` = your Agent backend URL
   - Deploy → copy the app URL.
4. In **Render**, for both backend services set **CORS_ORIGINS** to those two Vercel URLs (comma-separated), e.g. `https://2d3d-user.vercel.app,https://2d3d-agent.vercel.app`. Save so backends allow cookie auth from the frontends.

---

## Step 4 — Done

- **User app:** Vercel User Onboarding URL → register / login / place bets.
- **Agent app:** Vercel Agent Dashboard URL → login (e.g. admin / admin123).
- **APIs:** `https://your-backend-agent.onrender.com/docs`, `https://your-backend-user.onrender.com/docs`.

For free-tier limits and MCP setup, see **DEPLOY_FREE.md**.
