# Port list (2D3D project)

Local development ports for each service. Use these when running everything on one machine and for CORS.

| Service | Port | URL (local) | Notes |
|--------|------|-------------|--------|
| **Backend Agent** | **8000** | http://localhost:8000 | FastAPI — Agent Dashboard API, docs at `/docs` |
| **Backend User** | **8001** | http://localhost:8001 | FastAPI — User Onboarding / Player API, docs at `/docs` |
| **Frontend Agent (Agentdashboard2d3d)** | **5173** (default) | http://localhost:5173 | Vite dev server (first app if only one running) |
| **Frontend User (Useronboarding)** | **5174** or **5173** | http://localhost:5174 or :5173 | Vite dev server — 5174 if Agent app already on 5173 |

---

## Summary

| Component | Port |
|-----------|------|
| backend-agent | **8000** |
| backend-user | **8001** |
| Agentdashboard2d3d (Vite) | **5173** (or next free, e.g. 5174) |
| Useronboarding (Vite) | **5173** or **5174** |

---

## Production (Render / Vercel)

- **Render:** Backends use `$PORT` (set by Render; no fixed port).
- **Vercel:** Frontends are static; no port (served on Vercel URLs).

---

## CORS (backends)

When running frontends locally, backends need the dev origins in `CORS_ORIGINS`, e.g.:

```text
http://localhost:5173,http://localhost:5174
```

The `.env` files for both backends already use these for local dev.
