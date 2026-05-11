// src/lib/auth.ts
const BASE_URL = 'https://darul-furqon-be.fly.dev';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login gagal');
  }

  const json = await res.json();
  const data = json.data || json;

  const accessToken = data.accessToken;
  const refreshToken = data.refreshToken;

  if (!accessToken) {
    throw new Error('Format response login tidak valid: token tidak ditemukan');
  }

  // Extract user info from JWT if not present in response
  const decoded = parseJwt(accessToken);
  const user = data.user || {
    id: decoded?.id || data.id || 'unknown',
    name: data.name || data.fullName || email.split('@')[0], // Fallback to email prefix
    email: email,
    role: decoded?.role || data.role || 'APPLICANT'
  };

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken || '');
  localStorage.setItem('userName', user.name);
  localStorage.setItem('userRole', user.role);
  
  return { ...data, accessToken, refreshToken, user };
}

export async function register(name: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registrasi gagal');
  }
}

export function isAdmin(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem('userRole') === 'ADMIN';
}

export function logout(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  }
}
