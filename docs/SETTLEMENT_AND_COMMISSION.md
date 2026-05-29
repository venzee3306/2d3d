# Settlement and Commission

## What is implemented

### 1. Refund to winning players (settlement)

- **User Backend** (`backend-user`):
  - **`POST /bets/settle`** (internal API, `X-Internal-API-Key`):
    - **By session:** `session_id` + `round_name` + `game_type` + `winning_number` → settle all pending bets for that session.
    - **By round (full day):** `date` (YYYY-MM-DD) + `round_name` + `game_type` + `winning_number` → settle all pending bets for that round across all sessions.
  - Marks matching bets as **Won** (credits player balance with `amount × payout_multiplier`), others as **Lost**.
  - Updates player `balance`, `win_amount`, `loss_amount`; creates **win** transactions; syncs player snapshot to Agent Backend; fires **bet.settled** and **balance.updated** callbacks for external platforms.

### 2. Scheduled settlement after 12:01 PM and 4:30 PM (Myanmar time)

- **User Backend** runs an **APScheduler** (Asia/Yangon):
  - **12:05** → fetches today’s 2D result for **12:01 PM** from SET 2D service (`/api/v1/2d/daily`), then runs **round settlement** for **Morning** 2D (all pending bets for today + `round_name=Morning`).
  - **16:35** → fetches today’s 2D result for **4:30 PM**, then runs **round settlement** for **Evening** 2D.
- So once the result is published (e.g. 12:00 / 4:30), a few minutes later the system automatically settles that round and refunds units to winning players.

### 3. Agent / Master commission (current behavior)

- **Commission is display-only**, not stored or paid out automatically:
  - **Agent Dashboard** stats (e.g. “today’s commission”) use **total_sales × 5%** (fixed `DEFAULT_COMMISSION_RATE` in `backend-agent/app/routers/stats.py`).
  - Per-agent **commission_rate** (and master’s rate) are stored and used in the UI (e.g. Agent Statement modal shows “ကော်မရှင်ကြေး” from statement API), but **no automatic calculation or crediting of commission to agent/master balance** runs after settlement.
- So:
  - **Settlement** = refund to players who won ✅ (implemented and scheduled).
  - **Commission** = currently a **display/analytics** value only; a future “commission run” could compute and store (or credit) agent/master commission per round/day using each agent’s `commission_rate` and hierarchy.

## Summary

| Part | Status |
|------|--------|
| User bets → stored (pending) | ✅ |
| Result released (12:01 / 4:30) | ✅ Captured by set-2d-service |
| Scheduled job to settle round after result | ✅ User backend scheduler 12:05 & 16:35 |
| Refund units to winning players | ✅ Via `POST /bets/settle` (by round or session) |
| Agent commission **calculation** (display) | ✅ Dashboard uses 5% of sales (or statement API) |
| Agent/Master commission **stored or credited** | ❌ Not implemented (display-only) |

To add **stored/credited commission**, you would run a post-settlement step (or separate cron) that, for each agent (and master), computes commission (e.g. sales × agent’s `commission_rate`) and either writes to a ledger or credits the agent’s balance.

---

## Backend-Agent’s role

- **Settlement:** Backend-agent does **not** run settlement. All bet settlement (refund to players) is in **backend-user** (scheduler + `POST /bets/settle`). Backend-agent only **consumes** the result: when the dashboard loads, it calls backend-user’s `GET /internal/today-summary` and gets updated `total_sales` and `total_payouts` (which already include the settled rounds).
- **Commission (current):**
  - **Stats** (`GET /stats`): `today_commission` and `today_net_profit` are computed in backend-agent as `total_sales × 5%` (fixed rate). Per-user `commission_rate` is stored in the DB but **not** used for this aggregate.
  - **Statement / UI:** Per-agent commission can be shown from statement/breakdown APIs using stored rates; still **display-only**, no crediting.
- **What could be added in backend-agent:**
  - **Commission run (scheduled or triggered):** After each round (or daily), call backend-user for **per-agent** today sales (new or existing endpoint), then for each agent (and master) compute `commission = sales × (user.commission_rate / 100)` and **credit** `UserBalance` (and write a `Transaction`). That would make commission real (stored/credited), not just displayed.
  - **Use per-agent rate in stats:** Optionally, in `GET /stats` or agent-breakdown, use each agent’s `commission_rate` for display instead of the global 5%.
