/**
 * API client for Agent Dashboard Backend.
 * Base URL from env: VITE_AGENT_API_URL (default http://localhost:8000)
 */
const getBaseUrl = (): string =>
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_AGENT_API_URL
    ? String(import.meta.env.VITE_AGENT_API_URL).replace(/\/$/, '')
    : 'http://localhost:8000';

let token: string | null = null;

export function setAuthToken(t: string | null) {
  token = t;
}

export function getAuthToken(): string | null {
  return token;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token && token !== 'cookie') headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AgentUser = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'master' | 'agent';
  parent_id?: string | null;
};

export type AgentPlayer = {
  player_id: string;
  agent_id: string;
  name: string;
  phone_number: string | null;
  current_balance: number;
  total_bets: number;
  total_amount: number;
  win_amount: number;
  loss_amount: number;
  status: string;
  last_bet_at: string | null;
};

export type BalanceResponse = { user_id: string; balance: number; locked_balance: number };

export type DepositRequestResponse = {
  id: string;
  player_id: string;
  player_name: string;
  agent_id: string;
  amount: number;
  transaction_id: string;
  payment_method: string | null;
  status: string;
  requested_at: string;
  note: string | null;
};

export type WithdrawalRequestResponse = {
  id: string;
  user_id: string;
  user_name: string;
  to_user_id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  account_name: string;
  status: string;
  requested_at: string;
  note: string | null;
};

export type UnitDepositRequestResponse = {
  id: string;
  requester_id: string;
  requester_name: string;
  approver_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: string;
  requested_at: string;
  note: string | null;
};

export const agentApi = {
  login: (username: string, password: string) =>
    api<{ user: AgentUser; token_type?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    }),
  getUsers: (params?: { role?: string; parent_id?: string; search?: string; skip?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.role) sp.set('role', params.role);
    if (params?.parent_id) sp.set('parent_id', params.parent_id);
    if (params?.search) sp.set('search', params.search);
    if (params?.skip != null) sp.set('skip', String(params.skip));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return api<AgentUser[]>(`/users${q ? `?${q}` : ''}`);
  },
  createUser: (data: { name: string; username: string; password: string; role: string; parent_id?: string | null }) =>
    api<AgentUser>('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
        parent_id: data.parent_id ?? null,
      }),
    }),
  updateUser: (userId: string, data: { name?: string; username?: string; password?: string; role?: string; parent_id?: string | null }) =>
    api<AgentUser>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.username !== undefined && { username: data.username }),
        ...(data.password !== undefined && data.password !== '' && { password: data.password }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.parent_id !== undefined && { parent_id: data.parent_id }),
      }),
    }),
  deleteUser: (userId: string) =>
    api<{ ok: boolean }>(`/users/${userId}`, { method: 'DELETE' }),
  getPlayers: (agentId?: string) =>
    api<AgentPlayer[]>(agentId ? `/players?agent_id=${encodeURIComponent(agentId)}` : '/players'),
  getMyBalance: () => api<BalanceResponse>('/balances/me'),
  getBalance: (userId: string) => api<BalanceResponse>(`/balances/${userId}`),
  transfer: (toUserId: string, amount: number, note?: string) =>
    api<{ ok: boolean }>('/balances/transfer', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, note }),
    }),
  createUnits: (userId: string, amount: number, note?: string) =>
    api<{ ok: boolean }>('/balances/create-units', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, amount, note }),
    }),
  getDepositRequests: (agentId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (agentId) params.set('agent_id', agentId);
    if (status) params.set('status', status);
    const q = params.toString();
    return api<DepositRequestResponse[]>(`/requests/deposits${q ? `?${q}` : ''}`);
  },
  getWithdrawalRequests: () => api<WithdrawalRequestResponse[]>('/requests/withdrawals'),
  getUnitDepositRequests: () => api<UnitDepositRequestResponse[]>('/requests/unit-deposits'),
  approveDeposit: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/deposits/${requestId}/approve`, { method: 'POST' }),
  rejectDeposit: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/deposits/${requestId}/reject`, { method: 'POST' }),
  approveWithdrawal: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/withdrawals/${requestId}/approve`, { method: 'POST' }),
  rejectWithdrawal: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/withdrawals/${requestId}/reject`, { method: 'POST' }),
  approveUnitDeposit: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/unit-deposits/${requestId}/approve`, { method: 'POST' }),
  rejectUnitDeposit: (requestId: string) =>
    api<{ ok: boolean }>(`/requests/unit-deposits/${requestId}/reject`, { method: 'POST' }),
};
