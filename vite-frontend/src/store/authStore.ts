import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

// Wraps fetch with automatic JWT refresh on 401.
// Safe to call outside React components (no hook required).
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { token, logout } = useAuthStore.getState();

  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const headers = { ...(options.headers as Record<string, string> | undefined), ...authHeaders };

  const res = await fetch(url, { ...options, headers });

  if (res.status !== 401) return res;

  // Try to refresh
  const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
  if (!refreshRes.ok) {
    await logout();
    window.location.href = '/espace-client';
    return res;
  }

  const { token: newToken } = (await refreshRes.json()) as { token: string };
  useAuthStore.setState({ token: newToken });

  // Retry original request with new token
  return fetch(url, {
    ...options,
    headers: { ...(options.headers as Record<string, string> | undefined), Authorization: `Bearer ${newToken}` },
  });
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Connexion échouée');

        const token = data.token as string;
        const profileRes = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = (await profileRes.json()) as AuthUser;
        set({ token, user });
      },

      register: async ({ firstname, lastname, email, password, confirm }) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstname, lastname, email, password, confirm, role_id: 1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Inscription échouée');

        const token = data.token as string;
        const user = data.data as AuthUser;
        set({ token, user });
      },

      logout: async () => {
        const { token } = get();
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => {});
        set({ token: null, user: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'zz-auth', partialize: (state) => ({ user: state.user }) },
  ),
);
