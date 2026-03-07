# Vercel deployment (2d3d frontends)

Your two Vercel projects (**2d3d**, **2d3d-eonb**) use the monorepo with frontends in Git submodules. Use these settings so builds succeed.

---

## 1. Project **2d3d** (User onboarding)

In [Vercel Dashboard](https://vercel.com) → **2d3d** → **Settings** → **General**:

| Setting | Value |
|--------|--------|
| **Root Directory** | Leave empty (build from repo root) |
| **Build Command** | `bash scripts/vercel-build.sh Useronboarding` |
| **Output Directory** | `Useronboarding/dist` |
| **Install Command** | *(leave empty; root `vercel.json` sets `git submodule update --init --recursive`)* |

In **Settings** → **Environment Variables**, add for Production (and Preview if needed):

- `VITE_USER_API_URL` = your User backend URL (e.g. `https://2d3d-backend-user.onrender.com`)

---

## 2. Project **2d3d-eonb** (Agent dashboard)

In [Vercel Dashboard](https://vercel.com) → **2d3d-eonb** → **Settings** → **General**:

| Setting | Value |
|--------|--------|
| **Root Directory** | Leave empty |
| **Build Command** | `bash scripts/vercel-build.sh Agentdashboard2d3d` |
| **Output Directory** | `Agentdashboard2d3d/dist` |

In **Settings** → **Environment Variables**:

- `VITE_AGENT_API_URL` = your Agent backend URL (e.g. `https://2d3d-backend-agent.onrender.com`)

---

## 3. What’s in the repo

- **Root `vercel.json`**  
  - `installCommand`: `git submodule update --init --recursive` so submodules are available before the build.

- **`.gitmodules`**  
  - Submodule URLs use **HTTPS** (`https://github.com/...`) so Vercel can fetch them without SSH.

- **`scripts/vercel-build.sh`**  
  - Receives the app directory name, runs `npm ci` and `npm run build` there.

---

## 4. Deploy

1. Apply the settings above for both projects.
2. Push your branch (e.g. `main`); Vercel will deploy both projects.
3. Or in each project go to **Deployments** → latest → **Redeploy** (after saving the new settings).

---

## 5. If submodule fetch fails (private repos)

If you see “Failed to fetch one or more git submodules”:

1. Create a [GitHub fine‑grained PAT](https://github.com/settings/tokens) with read access to the submodule repos.
2. In each Vercel project, add an **Environment Variable**:
   - Name: `GITHUB_REPO_CLONE_TOKEN` (or `GITHUB_PAT`)
   - Value: the token
   - Scope: Production (and Preview if you use it)
3. In **Settings** → **General**, set **Install Command** to:
   ```bash
   git submodule update --init --recursive
   ```
   (Or use a script that rewrites submodule URLs to `https://${GITHUB_REPO_CLONE_TOKEN}@github.com/...` before `git submodule update`; see [Vercel submodules](https://vercel.com/docs/builds/build-features).)
