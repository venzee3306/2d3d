# Backend To-Do List

## Summary

Both frontends (**Agent Dashboard** and **User Onboarding**) use **100% mock data** today. They do **not** call any real APIs. The backends implement most of the API coverage described in `API_COVERAGE.md`, but several features required by the frontend are missing or incomplete.

---

## Feature Comparison

### Agent Dashboard Features (Frontend)

| Feature | Frontend Component | Data Source (Current) | Backend API | Status |
|--------|--------------------|------------------------|-------------|--------|
| Login | LoginPage | Mock users | POST /auth/login | ✅ Backend exists, FE not wired |
| Dashboard stats | AdminDashboard, MasterDashboard, DashboardView | Mock | GET /stats | ✅ Exists |
| Users (CRUD) | AdminMastersView, MasterAgentsView | Mock | GET/POST/PATCH/DELETE /users | ✅ Exists |
| Players list | PlayersView, MasterAgentsView | Mock | GET /players | ✅ Exists |
| Balances | All dashboards | Mock | GET /balances/me, /balances/:id | ✅ Exists |
| Transfer units | UnitsManagementV2, TransferUnitsModal | Mock | POST /balances/transfer | ✅ Exists |
| Create units | UnitsManagement | Mock | POST /balances/create-units | ✅ Exists |
| Deposit requests (player) | DepositsView, MasterDepositsView | Mock | GET/POST /requests/deposits, approve, reject | ✅ Exists |
| Withdrawal requests | WithdrawalsView | Mock | GET/POST /requests/withdrawals, approve, reject | ✅ Exists |
| Unit deposit requests | WithdrawalsView, UnitsManagementV2 | Mock | GET/POST /requests/unit-deposits, approve, reject | ✅ Exists |
| **Bank accounts** | BankSettingsView, MobileBankSettings | Mock | — | ❌ **Missing** |
| **Payment methods** | BankSettingsView | Mock | — | ❌ **Missing** |
| **Blocked numbers (update)** | BlockedNumbersModal | Mock | — | ❌ **Missing** |
| Transactions | TransactionsView | Mock | — | ❌ No GET /transactions in agent backend |
| Agent bet ledger / statement | AgentBetLedgerModal, AgentStatementModal | Mock | — | ⚠️ Partial (bets in user backend) |
| Buy Units flow | BuyUnitsPaymentFlow | Mock master bank accounts | Needs bank accounts | ❌ Depends on bank accounts |

### User Onboarding Features (Frontend)

| Feature | Frontend Component | Data Source (Current) | Backend API | Status |
|--------|--------------------|------------------------|-------------|--------|
| Login | NewLoginScreen | mockPlayer (aungaung/player123) | POST /auth/login | ✅ Backend exists, FE not wired |
| Register | — | — | POST /auth/register | ✅ Exists |
| Player profile | NewProfileScreen | mockPlayer | GET /players/me | ✅ Exists |
| Sessions | SessionSelectionModal | — | POST/GET /sessions | ✅ Exists |
| Place bets | NewBetScreen, PlayerBettingInterface | Context | POST /bets | ✅ Exists |
| Bet history | NewHistoryScreen | mockBets | GET /bets | ✅ Exists |
| Transactions | NewTransactionsScreen | mockTransactions | GET /transactions | ✅ Exists |
| Deposit (top-up) | DepositQRScreen, UnitRequestModal | MOCK_AGENT_PAYMENT_PROFILE | POST /deposit-requests | ✅ Exists (creates at agent) |
| **Bank accounts** | BankScreen, BankAccountModal | MOCK_BANK_ACCOUNTS | — | ❌ **Missing** |
| **Cash out** | CashoutModal | Mock | — | ❌ **Missing** |
| **Daily results (2D/3D)** | NewResultsScreen | mockDailyResults | — | ❌ **Missing** |
| **Payout rates** | NewBetScreen | mockPayoutRates | — | In bet settle logic, no GET |
| Notifications | NotificationPanel | generateMockNotifications | — | ⚠️ Optional / Phase 2 |

---

## Backend To-Do List

### backend-agent (Agent Dashboard API)

#### 1. Bank Accounts & Payment Methods (High priority)

The frontend `BankSettingsView` expects:

- List bank accounts per user (admin/master/agent)
- Add, edit, delete bank accounts
- Each account: `id`, `userId`, `paymentMethod`, `accountName`, `accountNumber`, `bankName?`, `qrCode?`, `isPrimary`
- Toggle allowed payment methods per user or globally

**To implement:**

- [ ] Add `BankAccount` model (user_id, payment_method, account_name, account_number, bank_name, qr_code_url, is_primary)
- [ ] Add migration for `bank_accounts` table
- [ ] `GET /bank-accounts` – list current user's bank accounts
- [ ] `POST /bank-accounts` – add bank account
- [ ] `PATCH /bank-accounts/:id` – update bank account
- [ ] `DELETE /bank-accounts/:id` – remove bank account
- [ ] (Optional) `GET /bank-accounts/:userId` – for admin viewing another user's accounts
- [ ] (Optional) `GET/PATCH /payment-methods` – allowed payment methods per user

#### 2. Blocked Numbers – Update API (High priority)

`BlockedNumber` model exists. `GET /internal/agents/:id/limits` returns blocked numbers. Masters need a route to **set** blocked numbers.

**To implement:**

- [ ] `PUT /agents/:agent_id/blocked-numbers` – body: `{ "2D": string[], "3D": string[] }`
- [ ] Require `current_user.role in ('admin','master')` and `agent.parent_id == current_user.id` (or admin)
- [ ] Replace existing blocked numbers for that agent with the new set

#### 3. Transactions (Medium priority)

`TransactionsView` shows transaction history. Backend has `Transaction` model but no list endpoint for the Agent Dashboard.

**To implement:**

- [ ] `GET /transactions` – list transactions for current user (and optionally by type, date range)
- [ ] Return: id, type, amount, balance_before, balance_after, related_user_id, timestamp, etc.

---

### backend-user (User Onboarding API)

#### 4. Player Bank Accounts (High priority)

`BankScreen` and `BankAccountModal` manage player bank accounts (for cash out, etc.).

**To implement:**

- [ ] Add `BankAccount` model (player_id, payment_method, account_name, account_number, bank_name, is_default)
- [ ] Add migration for `bank_accounts` table
- [ ] `GET /players/me/bank-accounts` – list current player's bank accounts
- [ ] `POST /players/me/bank-accounts` – add bank account
- [ ] `PATCH /players/me/bank-accounts/:id` – update bank account
- [ ] `DELETE /players/me/bank-accounts/:id` – remove bank account

#### 5. Cash Out (Withdrawal Request) (High priority)

`CashoutModal` submits a player withdrawal request. This should create a withdrawal at the agent backend (player → agent).

**To implement:**

- [ ] Define flow: Player requests withdrawal → backend-user creates request → sync to backend-agent
- [ ] Add `POST /withdrawal-requests` (or similar) – body: amount, payment_method, account_number, account_name, note?
- [ ] backend-user calls backend-agent internal API to create withdrawal request for the player's agent
- [ ] Or: Add `POST /internal/player-withdrawals` in backend-agent, called by backend-user

#### 6. Daily Results (Draws) (Medium priority)

`NewResultsScreen` shows 2D morning/evening and 3D results. Currently mock data.

**To implement:**

- [ ] Add `Draw` or `DailyResult` model (date, round: 'morning'|'evening', game_type: '2D'|'3D', winning_number)
- [ ] Add migration
- [ ] `GET /results` – query params: date?, game_type?, round?
- [ ] `POST /results` (admin/internal) – create/update draw result (for settlement)
- [ ] Integrate with `POST /bets/settle` – settlement uses these results

#### 7. Payout Rates (Low priority)

Frontend uses payout rates (2D=85x, 3D=500x). Currently in `PAYOUT_MULTIPLIER` in backend-user bet schema. No GET endpoint.

**To implement:**

- [ ] `GET /payout-rates` – return `{ "2D": 85, "3D": 500 }` (or from config/DB)

---

## Frontend Integration (Not Backend, but Required)

The frontends must be wired to call the real APIs instead of mock data:

### Agent Dashboard

- [ ] Add `src/app/api/client.ts` (or equivalent) – fetch wrapper with `VITE_AGENT_API_URL`, credentials
- [ ] Replace `LoginPage` mock validation with `POST /auth/login`
- [ ] After login, fetch users, players, stats, balances, requests in parallel (as per API_COVERAGE)
- [ ] Replace all App state data sources with API calls
- [ ] Handle 401 → redirect to login or refresh token

### User Onboarding

- [ ] Add API client with `VITE_USER_API_URL`, credentials
- [ ] Replace `NewAppContext` login with `POST /auth/login`
- [ ] Replace mock data: player, sessions, bets, transactions, deposit requests with API calls
- [ ] Wire DepositQRScreen to `POST /deposit-requests` (backend-user creates at agent)
- [ ] Wire BankScreen to new bank-accounts API
- [ ] Wire CashoutModal to new cash-out/withdrawal API
- [ ] Wire NewResultsScreen to new results API

---

## Suggested Order of Implementation

1. **backend-agent: Blocked numbers update** – small, unblocks master workflow
2. **backend-agent: Bank accounts** – required for Buy Units flow
3. **backend-agent: Transactions list** – quick win for TransactionsView
4. **backend-user: Player bank accounts** – required for cash out
5. **backend-user: Cash out** – player withdrawal flow
6. **backend-user: Daily results** – required for settlement and results screen
7. **backend-user: Payout rates GET** – low effort
8. **Frontend: Wire both apps to APIs** – after above are stable

---

## Quick Reference: Existing API Prefixes

### backend-agent (e.g. port 8000)

- `/auth` – login, refresh, logout
- `/users` – CRUD, /me
- `/agents` – list, /masters
- `/stats` – dashboard stats
- `/balances` – /me, /:id, transfer, create-units
- `/requests` – deposits, withdrawals, unit-deposits (CRUD + approve/reject)
- `/players` – list
- `/internal` – sync (used by backend-user)
- `/health` – health check

### backend-user (e.g. port 8001)

- `/auth` – login, register, refresh, logout, change-password
- `/players` – /me
- `/sessions` – create, list
- `/bets` – create, list, /settle (internal)
- `/transactions` – list
- `/deposit-requests` – create, list (creates at agent)
- `/internal` – players (used by agent)
- `/public` – external API (X-API-Key)
- `/health` – health check
