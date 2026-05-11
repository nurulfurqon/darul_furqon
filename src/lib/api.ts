// src/lib/api.ts
const BASE_URL = 'https://darul-furqon-be.fly.dev';

function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiUpload(
  context: 'documents' | 'teachers' | 'news' | 'gallery' | 'facilities' | 'foundation',
  file: File
): Promise<{ url: string }> {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/api/v1/uploads/?context=${context}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}
