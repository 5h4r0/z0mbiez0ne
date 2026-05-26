import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLE_IDS } from '../lib/roles.js';

export interface AuthUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number;
}

interface AuthStore {
  user: AuthUser | null;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirm: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: () => boolean;
}

// Flag module-level — évite les boucles infinies si plusieurs 401 simultanés
let isRefreshing = false;

// Déduplique les appels concurrents à refreshToken (StrictMode, double-mount)
let refreshPromise: Promise<void> | null = null;

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status !== 401 || isRefreshing) return res;

  isRefreshing = true;
  try {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      await useAuthStore.getState().logout();
      return res;
    }

    return fetch(url, { ...options, credentials: 'include' });
  } finally {
    isRefreshing = false;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isHydrating: true,

      login: async (email, password) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Connexion échouée');

        const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
        if (!profileRes.ok) throw new Error('Impossible de récupérer le profil');
        const user = (await profileRes.json()) as AuthUser;
        set({ user });
      },

      register: async ({ firstname, lastname, email, password, confirm }) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstname, lastname, email, password, confirm, role_id: ROLE_IDS.member }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Inscription échouée');

        const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
        if (!profileRes.ok) throw new Error('Impossible de récupérer le profil');
        const user = (await profileRes.json()) as AuthUser;
        set({ user });
      },

      logout: async () => {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
        set({ user: null });
      },

      // Appelé dans App.tsx au démarrage — toujours tenter, ne pas conditionner à user
      refreshToken: () => {
        if (refreshPromise) return refreshPromise;
        refreshPromise = (async () => {
          set({ isHydrating: true });
          try {
            const res = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });
            if (!res.ok) {
              set({ user: null, isHydrating: false });
              return;
            }

            const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
            if (!profileRes.ok) {
              set({ user: null, isHydrating: false });
              return;
            }

            const user = (await profileRes.json()) as AuthUser;
            set({ user, isHydrating: false });
          } catch {
            set({ user: null, isHydrating: false });
          }
        })().finally(() => {
          refreshPromise = null;
        });
        return refreshPromise;
      },

      isAuthenticated: () => !!get().user,
    }),
    { name: 'zz-auth', partialize: (state) => ({ user: state.user }) },
  ),
);
