# Deploy 2D3D now (quick steps)

Neon DBs are already created. Follow these steps to get both backends and frontends live.

---

## 1. Push this repo to GitHub

```bash
cd /home/venzee-lom/Desktop/work-space/2d3d
git init
git add .
git commit -m "Initial 2d3d: backends, frontends, Render blueprint"
```

Create a **new empty repo** on [GitHub](https://github.com/new) (e.g. `2d3d`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/2d3d.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy backends on Render (Blueprint)

1. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your **GitHub** account and select the `2d3d` repo.
3. Render will read `render.yaml` and create two services: **2d3d-backend-agent** and **2d3d-backend-user**.
4. Before or after first deploy, set **environment variables** for each service (Dashboard → service → Environment):

   **2d3d-backend-agent**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | *(from DEPLOY_ENV_EXAMPLE.md – Agent DB, postgresql+asyncpg://...)* |
   | `USER_BACKEND_URL` | *(set after User backend is live, e.g. https://2d3d-backend-user.onrender.com)* |
   | `CORS_ORIGINS` | *(after Vercel deploy, e.g. https://your-agent-app.vercel.app)* |

   **2d3d-backend-user**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | *(from DEPLOY_ENV_EXAMPLE.md – User DB, postgresql+asyncpg://...)* |
   | `AGENT_BACKEND_URL` | `https://2d3d-backend-agent.onrender.com` *(or your Agent service URL)* |
   | `CORS_ORIGINS` | *(after Vercel deploy, e.g. https://your-user-app.vercel.app)* |

5. **Save** and let Render redeploy if you changed env. Note the live URLs (e.g. `https://2d3d-backend-agent.onrender.com`).
6. Set **USER_BACKEND_URL** on the Agent service to the User backend URL, then save again.

---

## 3. Deploy frontends on Vercel

1. Open [Vercel](https://vercel.com) → **Add New** → **Project**, import the same `2d3d` repo.
2. **First project – User Onboarding**
   - Root Directory: **Useronboarding**
   - Build: `npm run build` (or `pnpm build`)
   - Environment variable: `VITE_USER_API_URL` = your User backend URL (e.g. `https://2d3d-backend-user.onrender.com`)
   - Deploy. Copy the frontend URL.
3. **Second project – Agent Dashboard**
   - Add another project from the same repo.
   - Root Directory: **Agentdashboard2d3d**
   - Build: `npm run build`
   - Environment variable: `VITE_AGENT_API_URL` = your Agent backend URL
   - Deploy. Copy the frontend URL.
4. In **Render**, set **CORS_ORIGINS** on both backend services to those two Vercel URLs (comma-separated), then save.

---

## 4. Done

- **User app:** Your Vercel User Onboarding URL → register/login, place bets.
- **Agent app:** Your Vercel Agent Dashboard URL → login (e.g. admin / admin123 after first deploy).
- **API docs:** `https://your-backend-agent.onrender.com/docs`, `https://your-backend-user.onrender.com/docs`.

Connection strings and more detail: **DEPLOY_ENV_EXAMPLE.md** (keep that file local; do not push if it contains real secrets, or use `.gitignore`).
