# Vercel deployment (2d3d frontends)

Your two Vercel projects (**2d3d**, **2d3d-eonb**) use the monorepo with frontends in Git submodules. Use these settings so builds succeed.

---

## 0. Required: GitHub token (private submodules)

The submodule repos (**Useronboarding**, **Agentdashboard2d3d**) are private, so Vercel needs a token to clone them.

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) (classic) or [fine-grained PAT](https://github.com/settings/tokens?type=beta) with **read** access to `venzee3306/Useronboarding` and `venzee3306/Agentdashboard2d3d`.
2. In **each** Vercel project (**2d3d** and **2d3d-eonb**): **Settings** → **Environment Variables** → add:
   - **Name:** `GITHUB_TOKEN` (or `GITHUB_REPO_CLONE_TOKEN`)
   - **Value:** your token
   - **Environment:** Production (and Preview if you use preview deploys)
3. Redeploy after saving the variable.

Without this, the install step will fail with “could not read Username for 'https://github.com'”.

---

## 1. Project **2d3d** (User onboarding)

In [Vercel Dashboard](https://vercel.com) → **2d3d** → **Settings** → **General**:

| Setting | Value |
|--------|--------|
| **Root Directory** | Leave empty (build from repo root) |
| **Build Command** | `bash scripts/vercel-build.sh Useronboarding` |
| **Output Directory** | `Useronboarding/dist` |
| **Install Command** | *(leave empty; root `vercel.json` runs `bash scripts/vercel-install.sh`)* |

In **Settings** → **Environment Variables**, add for Production (and Preview if needed):

- `GITHUB_TOKEN` (or `GITHUB_REPO_CLONE_TOKEN`) = your GitHub token (see §0)
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

- `GITHUB_TOKEN` (or `GITHUB_REPO_CLONE_TOKEN`) = your GitHub token (see §0)
- `VITE_AGENT_API_URL` = your Agent backend URL (e.g. `https://2d3d-backend-agent.onrender.com`)

---

## 3. What’s in the repo

- **Root `vercel.json`**  
  - `installCommand`: `bash scripts/vercel-install.sh` — cleans partial submodule dirs, uses `GITHUB_TOKEN` if set, then runs `git submodule update --init --recursive`.

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

## 5. If submodule fetch still fails

- **“could not read Username”** → Add `GITHUB_TOKEN` (or `GITHUB_REPO_CLONE_TOKEN`) in both projects (§0) and redeploy.
- **“destination path already exists”** → The install script removes submodule dirs before cloning; ensure you’re on the latest commit that includes `scripts/vercel-install.sh`.
- See [Vercel submodules](https://vercel.com/docs/builds/build-features) for more options.
