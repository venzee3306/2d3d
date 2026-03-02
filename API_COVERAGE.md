# API coverage: Frontends ↔ Backends

## Agent Dashboard FE → backend-agent (port 8000)

| FE call | Method + path | Backend route | Status |
|--------|----------------|---------------|--------|
| `agentApi.login` | POST /auth/login | auth: POST /login | ✅ |
| `agentApi.getStats` | GET /stats | stats: GET "" | ✅ |
| `agentApi.getUsers` | GET /users | users: GET "" | ✅ |
| `agentApi.getPlayers(agentId?)` | GET /players?agent_id= | players: GET "" | ✅ |
| `agentApi.getMyBalance` | GET /balances/me | balances: GET /me | ✅ |
| `agentApi.getBalance(userId)` | GET /balances/:userId | balances: GET /{user_id} | ✅ |
| `agentApi.transfer` | POST /balances/transfer | balances: POST /transfer | ✅ |
| `agentApi.createUnits` | POST /balances/create-units | balances: POST /create-units | ✅ |
| `agentApi.getDepositRequests(agentId?, status?)` | GET /requests/deposits?agent_id=&status= | requests: GET /deposits | ✅ |
| `agentApi.getWithdrawalRequests` | GET /requests/withdrawals | requests: GET /withdrawals | ✅ |
| `agentApi.getUnitDepositRequests` | GET /requests/unit-deposits | requests: GET /unit-deposits | ✅ |
| `agentApi.approveDeposit(requestId)` | POST /requests/deposits/:id/approve | requests: POST /deposits/{request_id}/approve | ✅ |
| `agentApi.rejectDeposit(requestId)` | POST /requests/deposits/:id/reject | requests: POST /deposits/{request_id}/reject | ✅ |
| `agentApi.approveWithdrawal(requestId)` | POST /requests/withdrawals/:id/approve | requests: POST /withdrawals/{request_id}/approve | ✅ |
| `agentApi.rejectWithdrawal(requestId)` | POST /requests/withdrawals/:id/reject | requests: POST /withdrawals/{request_id}/reject | ✅ |
| `agentApi.approveUnitDeposit(requestId)` | POST /requests/unit-deposits/:id/approve | requests: POST /unit-deposits/{request_id}/approve | ✅ |
| `agentApi.rejectUnitDeposit(requestId)` | POST /requests/unit-deposits/:id/reject | requests: POST /unit-deposits/{request_id}/reject | ✅ |

### Dashboard / Analytics (backend-agent)

| Purpose | Method + path | Status |
|--------|----------------|--------|
| Dashboard stats (totals for Analytics) | GET /stats → `{ total_masters, total_agents, total_players, total_bet_volume }` | ✅ |

After login with the real backend, the Agent Dashboard fetches **users**, **players**, **stats**, **balances**, and **requests** in one batch. A loading screen is shown until this completes, so Analytics, Masters, Units, Withdrawals, and Transactions all use API data (no hardcoded list).

### User management (backend-agent)

| Purpose | Method + path | Status |
|--------|----------------|--------|
| List users (with filters) | GET /users?role=&parent_id=&search=&skip=&limit= | ✅ |
| Current user | GET /users/me | ✅ |
| Update own profile / password | PATCH /users/me (body: name?, current_password?, new_password?) | ✅ |
| Change own password | POST /users/me/change-password (body: current_password, new_password) | ✅ |
| Create user | POST /users (admin/master) | ✅ |
| Get user | GET /users/:id | ✅ |
| Update user | PATCH /users/:id | ✅ |
| Delete user | DELETE /users/:id (admin) | ✅ |

**List visibility:** Admin sees all; master sees self + children; agent sees only self.

## User Onboarding FE → backend-user (port 8001)

| FE call | Method + path | Backend route | Status |
|--------|----------------|---------------|--------|
| `userApi.login` | POST /auth/login | auth: POST /login | ✅ (added) |
| `userApi.register` | POST /auth/register | auth: POST /register | ✅ (added) |
| `userApi.me` | GET /players/me | players: GET /me | ✅ |
| `userApi.getSessions` | GET /sessions | sessions: GET "" | ✅ |
| `userApi.createSession` | POST /sessions | sessions: POST "" | ✅ |
| `userApi.placeBets` | POST /bets | bets: POST "" | ✅ |
| `userApi.getBets(sessionId?)` | GET /bets?session_id= | bets: GET "" | ✅ |
| `userApi.getTransactions` | GET /transactions | transactions: GET "" | ✅ |

### Player / self management (backend-user)

| Purpose | Method + path | Status |
|--------|----------------|--------|
| Current player | GET /players/me | ✅ |
| Update own profile / password | PATCH /players/me (body: name?, phone_number?, current_password?, new_password?) | ✅ |
| Change own password | POST /auth/change-password (body: current_password, new_password) | ✅ |

## Internal / other (not called by FEs)

- **backend-user**  
  - POST /bets/settle (internal API key) – used by draw/settlement.  
  - GET /internal/players?agent_id=&status=&skip=&limit= – list players (X-Internal-API-Key).  
  - GET /internal/players/:id – get one player (X-Internal-API-Key).  
  - PATCH /internal/players/:id – update player name, phone_number, status (X-Internal-API-Key).  
  - GET /internal/players/:id/balance – player balance (X-Internal-API-Key).  
  - POST /public/players, GET /public/players/:id/balance, GET /public/players/:id/history, POST /public/players/:id/bets – for external platforms (X-API-Key).
- **backend-agent**  
  - Internal sync (e.g. POST /internal/players) – used by backend-user to sync players.

## Anti-copy: tokens not usable when copied

To prevent a copied token (e.g. from DevTools) from being used elsewhere:

1. **Cookie-only** (`AUTH_COOKIE_ONLY=true`, default): The server **ignores** `Authorization: Bearer <token>`. So pasting the token into Postman or another app does nothing; only the browser’s cookie is accepted. The token must be sent as a cookie (same origin / same site).

2. **User-Agent binding** (`AUTH_BIND_USER_AGENT=true`, default): A second cookie stores `HMAC(access_token, secret + User-Agent)`. Every request is checked: the same access token must be sent with the **same** User-Agent. If someone copies both cookies to another browser or device, the User-Agent usually differs → request is rejected with 401 "Invalid or copied token".

To allow Bearer again (e.g. for mobile or API clients), set `AUTH_COOKIE_ONLY=false`. To disable User-Agent binding (e.g. if it breaks after browser updates), set `AUTH_BIND_USER_AGENT=false`.

## Refresh tokens (both backends)

- **POST /auth/refresh** – body `{ "refresh_token": "..." }` → returns `{ "access_token": "...", "token_type": "bearer" }`.
- **Login/register** responses now include optional `refresh_token` and `refresh_expires_at` (ISO datetime). Frontends can store the refresh token (e.g. in memory or localStorage) and call `/auth/refresh` when the access token expires (e.g. on 401) to get a new access token without re-login.
- Access token expiry is configurable (`ACCESS_TOKEN_EXPIRE_MINUTES`, default 60). Refresh tokens expire after `REFRESH_TOKEN_EXPIRE_DAYS` (default 7) and are stored hashed in the DB (revocable).

## Change made

- **User backend** was missing the auth router (main.py imported it but the file did not exist). Added `app/routers/auth.py` with:
  - **POST /auth/login** – body `{ username, password }`, returns `{ access_token, player, refresh_token?, refresh_expires_at? }`.
  - **POST /auth/register** – body PlayerCreate (name, username, password, phone_number?, agent_id, source?, platform_id?), returns `{ access_token, player, refresh_token?, refresh_expires_at? }`.
  - **POST /auth/refresh** – body `{ refresh_token }`, returns `{ access_token }`.

- **Agent backend** auth now also returns `refresh_token` and `refresh_expires_at` on login and exposes **POST /auth/refresh**.

All APIs required by both frontends are now implemented and covered.
