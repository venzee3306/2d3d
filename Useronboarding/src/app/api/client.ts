/**
 * API client for User Onboarding Backend.
 * Base URL from env: VITE_USER_API_URL (default http://localhost:8001)
 */
import type { Player } from '../data/newMockData';

const getBaseUrl = (): string =>
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_USER_API_URL
    ? String(import.meta.env.VITE_USER_API_URL).replace(/\/$/, '')
    : 'http://localhost:8001';

const TOKEN_KEY = 'user_onboarding_token';

let token: string | null =
  typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

export function setAuthToken(t: string | null) {
  token = t;
  if (typeof localStorage !== 'undefined') {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return token;
}

/** When true, auth uses secure cookies (no Bearer header). */
export function useCookieAuth(): boolean {
  return token === 'cookie' || token === null;
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
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send/receive cookies (secure cookie auth)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Backend player response (snake_case) */
export type ApiPlayer = {
  id: string;
  name: string;
  username: string;
  phone_number: string | null;
  balance: number;
  agent_id: string;
  source: string;
  platform_id: string | null;
  status: string;
  created_at: string;
  total_bets: number;
  total_amount: number;
  win_amount: number;
  loss_amount: number;
  last_bet_at: string | null;
};

export function mapApiPlayerToPlayer(api: ApiPlayer): Player {
  return {
    id: api.id,
    name: api.name,
    nameMM: api.name,
    username: api.username,
    password: '',
    phoneNumber: api.phone_number ?? '',
    balance: api.balance,
    agentId: api.agent_id,
    status: api.status === 'suspended' ? 'suspended' : 'active',
    createdAt: api.created_at,
    source: api.source === 'api' ? 'api' : 'portal',
    platform_id: api.platform_id,
  };
}

/** Session from API */
export type ApiSession = { id: string; player_id: string; round_name: string; date: string };

/** Bet from API */
export type ApiBet = {
  id: string;
  player_id: string;
  session_id: string | null;
  game_type: string;
  bet_number: string;
  amount: number;
  round_name: string;
  status: string;
  win_amount: number | null;
  placed_at: string;
};

/** Transaction from API */
export type ApiTransaction = {
  id: string;
  player_id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  related_bet_id: string | null;
  timestamp: string;
};

export const userApi = {
  /** Response: { player } (tokens in HttpOnly cookies when using cookie auth). */
  login: (username: string, password: string) =>
    api<{ player: ApiPlayer; token_type?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    }),
  register: (data: {
    name: string;
    username: string;
    password: string;
    phone_number?: string;
    agent_id: string;
    source?: string;
    platform_id?: string | null;
  }) =>
    api<{ player: ApiPlayer; token_type?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
    }),
  refresh: () =>
    api<{ access_token?: string | null; token_type: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
      credentials: 'include',
    }),
  logout: () =>
    api<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }),
  me: () => api<ApiPlayer>('/players/me'),
  updateMe: (data: { name?: string; phone_number?: string; current_password?: string; new_password?: string }) =>
    api<ApiPlayer>('/players/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  changePassword: (current_password: string, new_password: string) =>
    api<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),
  getSessions: () => api<ApiSession[]>('/sessions'),
  createSession: (data: { round_name: string; date: string }) =>
    api<ApiSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  placeBets: (data: {
    session_id: string;
    round_name: string;
    game_type: '2D' | '3D';
    bets: Array<{ number: string; amount: number; pattern_type?: string; pattern_input?: string; pattern_label?: string }>;
  }) =>
    api<ApiBet[]>('/bets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBets: (sessionId?: string) =>
    api<ApiBet[]>(sessionId ? `/bets?session_id=${encodeURIComponent(sessionId)}` : '/bets'),
  getTransactions: () => api<ApiTransaction[]>('/transactions'),
};
