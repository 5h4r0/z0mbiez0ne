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
          body: JSON.stringify({ firstname, lastname, email, password, confirm, role_id: 2 }),
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
    { name: 'zz-auth' },
  ),
);
