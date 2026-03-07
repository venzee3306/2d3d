# MCP Setup (Render, Vercel, Neon, GitHub)

This project includes MCP (Model Context Protocol) configuration for Cursor so you can manage Render, Vercel, Neon, and GitHub from the IDE.

Config file: **`.cursor/mcp.json`**

---

## 1. Replace placeholders

Edit `.cursor/mcp.json` and replace the placeholders with your real credentials (do **not** commit real keys to git).

| Server  | Placeholder             | Where to get it |
|---------|-------------------------|------------------|
| **Render** | `YOUR_RENDER_API_KEY` | [Render Dashboard → Account Settings → API Keys](https://dashboard.render.com/settings#api-keys). Create a key and paste it. |
| **Vercel** | *(none)*               | No key in config. Use **URL only** (no `headers`). In Cursor, when Vercel MCP shows **"Needs login"**, click it to open the browser and complete OAuth. |
| **Neon** | `YOUR_NEON_API_KEY`    | [Neon Console → Settings → API Keys](https://console.neon.tech/app/settings/api-keys). Create a key and paste it. |
| **GitHub** | `YOUR_GITHUB_PAT`    | [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens). Create a token with scopes you need (e.g. `repo`, `read:org`). |

---

## 2. Optional: use environment variables (GitHub)

For GitHub you can avoid putting the token in the file by using an env var. Set in your shell or `.env`:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_xxxx"
```

Then in `.cursor/mcp.json` you can point the server at your environment (Cursor may pass through your shell env when it runs the `npx` command). If you prefer to keep the token only in the env, leave the JSON value as-is and ensure the variable is set before starting Cursor.

---

## 3. Restart Cursor

After editing `.cursor/mcp.json`, fully restart Cursor (quit and reopen) so the MCP servers reload.

---

## 4. What you can do with each server

| Server  | Typical use in Cursor |
|---------|------------------------|
| **Render** | List services, view logs, query Postgres, create services, update env vars. Set workspace first: *“Set my Render workspace to &lt;name&gt;”*. |
| **Vercel** | Inspect projects, deployments, logs; manage env and domains. You’ll sign in with Vercel (OAuth) when first used. |
| **Neon** | Manage Postgres (create branches, run SQL, inspect data). Use with your Neon API key (or OAuth if you switch to that). |
| **GitHub** | Read repos, issues, PRs; create issues/PRs; search code. Token scope depends on what you need. |

---

## 5. Security

- **Do not commit** real API keys or tokens. Keep `.cursor/mcp.json` with placeholders in the repo and fill keys locally, or use env vars where supported.
- Add `.cursor/mcp.json` to `.gitignore` only if you want the whole file local-only; otherwise keep the file in git with placeholders and document the setup (as here).

---

## 6. References

- [Render MCP Server](https://render.com/docs/mcp-server)
- [Vercel MCP (Cursor)](https://vercel.com/changelog/cursor-now-supported-on-vercel-mcp)
- [Neon MCP – Connect clients](https://neon.tech/docs/ai/connect-mcp-clients-to-neon)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
