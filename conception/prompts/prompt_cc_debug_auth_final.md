# Prompt CC — Debug auth — 14 bugs

Branche : `customer-account-dev`

**Objectif unique : corriger le code.** `CLAUDE_AI.md` est déjà à jour, ne pas y toucher.

Lire chaque fichier avant de le modifier. Appliquer dans l'ordre ci-dessous.
Commit final : `fix: 🐛 auth — httpOnly cookies, credentials, CORS, refresh rotation atomique, bfcache guard`

---

## Fichiers concernés

```
backend/src/app.ts
backend/src/config/cors.ts
backend/src/controllers/auth.controller.ts
backend/src/middlewares/requireAuth.ts
backend/src/lib/tokens.ts
backend/src/models/schema.prisma
vite-frontend/src/store/authStore.ts
vite-frontend/src/pages/dashboard/DashboardPage.tsx
vite-frontend/src/pages/dashboard/OrderDetailPage.tsx
vite-frontend/src/pages/BasketPage.tsx
```

---

## #9 — `cookie-parser` manquant (bloquant tout le reste)

**`backend/src/app.ts`**

Vérifier que `cookie-parser` est dans `backend/package.json`. Si absent :
```bash
cd backend && npm install cookie-parser && npm install -D @types/cookie-parser
```

Ajouter **avant** `express.json()` :
```ts
import cookieParser from 'cookie-parser';
// ...
app.use(cookieParser());
app.use(express.json());
```

---

## #2 — CORS sans `credentials: true`

**`backend/src/app.ts`**

Remplacer :
```ts
app.use(cors({ origin: config.server.allowedOrigins }));
```
Par :
```ts
app.use(cors({
  origin: config.server.allowedOrigins,
  credentials: true,
}));
```

**`backend/src/config/cors.ts`** — vérifier si `corsMiddleware` est importé ailleurs :
```bash
grep -r "corsMiddleware" backend/src --include="*.ts"
```
Si aucun résultat → supprimer le fichier `cors.ts`.

---

## #10 — Schéma Prisma : refonte `RefreshToken` (token_id UUID)

**`backend/src/models/schema.prisma`**

Remplacer le modèle actuel :
```prisma
model RefreshToken {
  id         Int      @id @default(autoincrement())
  token      String   @unique @db.Text
  user_id    Int
  issued_at  DateTime @default(now()) @db.Timestamp(6)
  expired_at DateTime @db.Timestamp(6)
  user users @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  @@map("refresh_token")
}
```

Par :
```prisma
model RefreshToken {
  id         Int      @id @default(autoincrement())
  token_id   String   @unique @db.VarChar(64)  // UUID stocké dans le cookie JWT — lookup O(1)
  token_hash String   @db.Text                  // hash argon2 du token_id — vérification anti-BDD-leak
  user_id    Int
  issued_at  DateTime @default(now()) @db.Timestamp(6)
  expired_at DateTime @db.Timestamp(6)
  user users @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  @@map("refresh_token")
}
```

Créer et appliquer la migration :
```bash
cd backend && npm run db:dev
```

---

## #10b — `tokens.ts` : `generateRefreshToken` retourne `{ jwt, tokenId }`

**`backend/src/lib/tokens.ts`**

Remplacer entièrement :
```ts
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

interface AccessTokenPayload {
  userId: number;
  roleId: number;
}

interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
}

type Expiry = NonNullable<jwt.SignOptions['expiresIn']>;

export function generateAccessToken(userId: number, roleId: number): string {
  return jwt.sign({ userId, roleId } satisfies AccessTokenPayload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as unknown as Expiry,
  });
}

export function generateRefreshToken(userId: number): { jwt: string; tokenId: string } {
  const tokenId = randomUUID();
  const token = jwt.sign({ userId, tokenId } satisfies RefreshTokenPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as unknown as Expiry,
  });
  return { jwt: token, tokenId };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
  if (typeof payload.userId !== 'number' || typeof payload.roleId !== 'number') {
    throw new Error('invalid access token payload');
  }
  return { userId: payload.userId, roleId: payload.roleId };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwt.refreshSecret) as jwt.JwtPayload;
  if (typeof payload.userId !== 'number' || typeof payload.tokenId !== 'string') {
    throw new Error('invalid refresh token payload');
  }
  return { userId: payload.userId, tokenId: payload.tokenId };
}
```

---

## #7 + #8 + #12 — `auth.controller.ts` : refonte complète

**`backend/src/controllers/auth.controller.ts`**

Remplacer entièrement le fichier :

```ts
import type { Request, Response } from 'express';
import z from 'zod';
import { config } from '../config/config.js';
import { comparePassword, hashPassword } from '../lib/auth.js';
import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/tokens.js';
import { prisma } from '../models/index.js';

const ACCESS_EXPIRES_MS = 15 * 60 * 1000;
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

const passwordBlacklist: string[] = process.env.PASSWORDS_BLACKLIST
  ? process.env.PASSWORDS_BLACKLIST.split(',').map((o) => o.trim())
  : [];

const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' })
  .refine((val) => !/\s/.test(val), { message: 'Password must not contain spaces' })
  .refine((val) => !passwordBlacklist.includes(val), { message: 'This password is not allowed' });

const registerBodySchema = z
  .object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.email(),
    role_id: z.number(),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export async function registerUser(req: Request, res: Response) {
  try {
    const { firstname, lastname, email, password, role_id } = await registerBodySchema.parseAsync(req.body);

    const existing = await prisma.users.findFirst({ where: { email } });
    if (existing) throw new ConflictError('Email already taken');

    const role = await prisma.roles.findUnique({ where: { id: role_id } });
    if (!role) return res.status(400).json({ status: 'error', message: 'Invalid role' });

    const password_hash = await hashPassword(password);
    const newUser = await prisma.users.create({
      data: { firstname, lastname, email, role_id, password_hash },
      select: { id: true, firstname: true, lastname: true, email: true, role_id: true },
    });

    const accessToken = generateAccessToken(newUser.id, newUser.role_id);
    const { jwt: refreshJwt, tokenId } = generateRefreshToken(newUser.id);

    await persistRefreshToken(newUser.id, tokenId);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshJwt);

    res.status(201).json({ status: 'success', data: newUser });
  } catch (error) {
    handleError(res, error, 'Failed to register user');
  }
}

const loginBodySchema = z.object({
  email: z.email({ message: 'invalid email address' }),
  password: z.string().min(1, { message: 'password is required' }),
});

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = await loginBodySchema.parseAsync(req.body);

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new UnauthorizedError('email and password do not match');

    const isMatching = await comparePassword(password, user.password_hash);
    if (!isMatching) throw new UnauthorizedError('email and password do not match');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const { jwt: refreshJwt, tokenId } = generateRefreshToken(user.id);

    await persistRefreshToken(user.id, tokenId);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshJwt);

    res.status(200).json({
      status: 'success',
      expiresInMS: ACCESS_EXPIRES_MS,
      message: `user ${email} logged in successfully`,
    });
  } catch (error) {
    handleError(res, error, 'login failed');
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const { userId } = verifyRefreshToken(raw);
      // Révoquer tous les tokens de l'utilisateur (déconnexion tous appareils)
      await prisma.refresh_token.deleteMany({ where: { user_id: userId } });
    }
  } catch {
    // silencieux — token invalide ou BDD indisponible
  } finally {
    // TOUJOURS clearer les cookies même si BDD throw
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  }
  res.status(200).json({ status: 'success', message: 'logged out' });
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) throw new UnauthorizedError('refresh token not provided');

    const { userId, tokenId } = verifyRefreshToken(raw);

    // Lookup O(1) par token_id (UUID unique) — pas de boucle argon2
    const stored = await prisma.refresh_token.findUnique({
      where: { token_id: tokenId },
    });

    if (!stored || stored.user_id !== userId || stored.expired_at < new Date()) {
      throw new UnauthorizedError('refresh token invalid or expired');
    }

    // Vérifier le hash (protection si BDD compromise)
    const valid = await comparePassword(tokenId, stored.token_hash);
    if (!valid) throw new UnauthorizedError('refresh token hash mismatch');

    // DELETE atomique — rowCount 0 = token déjà consommé (race condition)
    const deleted = await prisma.refresh_token.deleteMany({
      where: { id: stored.id, user_id: userId },
    });
    if (deleted.count === 0) throw new UnauthorizedError('refresh token already used');

    // Nettoyage tokens expirés (housekeeping silencieux)
    prisma.refresh_token.deleteMany({
      where: { user_id: userId, expired_at: { lt: new Date() } },
    }).catch(() => {});

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('user not found');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const { jwt: newRefreshJwt, tokenId: newTokenId } = generateRefreshToken(user.id);

    await persistRefreshToken(user.id, newTokenId);
    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshJwt);

    res.status(200).json({ status: 'success', expiresInMS: ACCESS_EXPIRES_MS });
  } catch (error) {
    handleError(res, error, 'failed to refresh token');
  }
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  try {
    if (!req.user) throw new UnauthorizedError('not authenticated');
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      omit: { password_hash: true },
    });
    if (!user) throw new UnauthorizedError('user not found');
    res.json(user);
  } catch (error) {
    handleError(res, error, 'failed to get user');
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function persistRefreshToken(userId: number, tokenId: string): Promise<void> {
  const token_hash = await hashPassword(tokenId);
  await prisma.refresh_token.create({
    data: {
      token_id: tokenId,
      token_hash,
      user_id: userId,
      issued_at: new Date(),
      expired_at: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });
}

function setAccessCookie(res: Response, token: string): void {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: config.server.secure,
    sameSite: 'strict',
    path: '/',
    maxAge: ACCESS_EXPIRES_MS,
  });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.server.secure,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: REFRESH_EXPIRES_MS,
  });
}

function handleError(res: Response, error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ status: 'error', message: error.issues.map((e) => e.message).join(', ') });
  }
  res.status((error as { status?: number }).status || 500).json({
    status: 'error',
    message: (error as Error).message || fallback,
  });
}
```

---

## #13 — `requireAuth` : cookie + distinction `TokenExpiredError`

**`backend/src/middlewares/requireAuth.ts`**

Remplacer entièrement :
```ts
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/tokens.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedError('missing access token');

    const { userId, roleId } = verifyAccessToken(token);
    req.user = { id: userId, roleId };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('access token expired'));
    } else {
      next(new UnauthorizedError('invalid access token'));
    }
  }
}
```

---

## #1 + #14 — `authStore.ts` : refonte complète

**`vite-frontend/src/store/authStore.ts`**

Remplacer entièrement :
```ts
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
      window.location.href = '/dashboard';
      return res;
    }

    return fetch(url, { ...options, credentials: 'include' });
  } finally {
    isRefreshing = false;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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
          body: JSON.stringify({ firstname, lastname, email, password, confirm, role_id: 1 }),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Inscription échouée');

        const user = data.data as AuthUser;
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
      refreshToken: async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (!res.ok) { set({ user: null, isHydrating: false }); return; }

          const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
          if (!profileRes.ok) { set({ user: null, isHydrating: false }); return; }

          const user = (await profileRes.json()) as AuthUser;
          set({ user, isHydrating: false });
        } catch {
          set({ user: null, isHydrating: false });
        }
      },

      isAuthenticated: () => !!useAuthStore.getState().user,
    }),
    { name: 'zz-auth', partialize: (state) => ({ user: state.user }) },
  ),
);
```

---

## #4 — Guards réseau au montage des pages protégées

### `vite-frontend/src/pages/dashboard/DashboardPage.tsx`

Ajouter ce `useEffect` **avant** celui qui charge les commandes :
```ts
// Guard bfcache — vérifie la session côté réseau au montage
useEffect(() => {
  if (isHydrating) return;
  if (!user) navigate('/dashboard', { replace: true });
}, [isHydrating, user, navigate]);
```

### `vite-frontend/src/pages/dashboard/OrderDetailPage.tsx`

Ajouter après les hooks existants :
```ts
const { user, isHydrating } = useAuthStore();
const navigate = useNavigate();

useEffect(() => {
  if (isHydrating) return;
  if (!user) navigate('/dashboard', { replace: true });
}, [isHydrating, user, navigate]);
```

### `vite-frontend/src/pages/BasketPage.tsx`

Corriger le label du bouton Commander :
```tsx
{ordering ? 'Commande en cours…' : (user || isHydrating) ? 'Commander' : 'Se connecter pour commander'}
```

---

## Vérifications finales

```bash
# Aucun token en localStorage/sessionStorage
grep -r "localStorage\|sessionStorage" vite-frontend/src --include="*.ts" --include="*.tsx"

# Aucun Authorization: Bearer manuel restant
grep -r "Authorization" vite-frontend/src --include="*.ts" --include="*.tsx"

# Aucun data.token lu côté frontend (breaking change /login response)
grep -r "data\.token\|res\.token" vite-frontend/src --include="*.ts" --include="*.tsx"

# cookie-parser présent
grep "cookie-parser" backend/package.json

# Migration OK
cd backend && npm run db:dev

# Lint
npm run lint --prefix backend
npm run lint --prefix vite-frontend
```

---

## Commit

```
fix: 🐛 auth — httpOnly cookies, credentials, CORS, refresh rotation atomique, bfcache guard
```

---

## Bugs résolus post-session (2026-05-20 — aprem)

### #15 — `prisma.refresh_token` au lieu de `prisma.refreshToken`
**`backend/src/controllers/auth.controller.ts`**
5 occurrences en snake_case — le client Prisma génère du camelCase.
Remplacer toutes les occurrences de `prisma.refresh_token` par `prisma.refreshToken`.

### #16 — Colonnes `token_id` / `token_hash` absentes en BDD
Schéma Prisma mis à jour mais migration non appliquée en prod/dev.
Résolu via :
```bash
cd backend && npm run db:deploy && npm run db:gen
```