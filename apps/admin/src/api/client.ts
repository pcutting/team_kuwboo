const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export function sendOtp(phone: string) {
  return request('/auth/phone/send-otp', {
    method: 'POST',
    body: { phone },
  });
}

export function verifyOtp(phone: string, code: string) {
  return request<{
    data: {
      accessToken: string;
      refreshToken: string;
      user: { id: string; name: string; role: string; avatarUrl?: string };
      isNewUser: boolean;
    };
  }>('/auth/phone/verify-otp', {
    method: 'POST',
    body: { phone, code },
  });
}

export function refreshTokens(accessToken: string, refreshToken: string) {
  return request<{ data: { accessToken: string; refreshToken: string } }>(
    '/auth/refresh',
    {
      method: 'POST',
      body: { refreshToken },
      token: accessToken,
    },
  );
}

// Admin
export function getStats(token: string) {
  return request<{ data: Record<string, number> }>('/admin/stats', { token });
}

export function listUsers(token: string, params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{
    data: { items: Array<Record<string, unknown>>; total: number };
  }>(`/admin/users${query}`, { token });
}

// Bots
export function getBotStats(token: string) {
  return request<{ data: Record<string, number> }>('/admin/bots/stats', {
    token,
  });
}

export function listBots(token: string, params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{
    data: { items: Array<Record<string, unknown>>; total: number };
  }>(`/admin/bots${query}`, { token });
}
