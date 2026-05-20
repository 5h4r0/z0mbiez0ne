# Prompt CC — Deux tâches

---

## Tâche 1 : Créer `CLAUDE_AI.md` à la racine du repo

Créer le fichier suivant **exactement** :

```markdown
# CLAUDE_AI.md
> Référence de session pour claude.ai — décisions validées, règles projet, patterns approuvés.
> À cloner au début de chaque discussion importante.

---

## Accès au repo

```bash
git clone https://github.com/5h4r0/z0mbiez0ne.git
cd z0mbiez0ne && git checkout customer-account-dev
```

Toujours cloner et lire les fichiers concernés avant d'analyser ou proposer une correction.

---

## Accès à gstack (skills Garry Tan / YC)

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git /tmp/gstack
```

Appliquer les skills pertinents avant toute réponse sur : sécurité, architecture, review de code, debug, perf, UX.

Skills utiles pour ce projet :
- `/review` + `review/specialists/security.md` → avant toute analyse sécurité ou auth
- `/review` + `review/specialists/performance.md` → avant toute proposition d'optimisation
- `/review` + `review/specialists/api-contract.md` → avant toute modification d'endpoint
- `/review` + `review/specialists/testing.md` → avant toute proposition de tests
- `/plan-eng-review` → avant toute proposition d'architecture
- `/investigate` → pour tout debug (Iron Law : pas de fix sans root cause)
- `/review/checklist.md` → Pass 1 CRITICAL systématique sur tout diff important

---

## Règles de réponse

- Toujours préfixer les fichiers de code avec leur chemin relatif au monorepo
- Appliquer les bonnes pratiques d'office (sécurité, perf, archi, UX, naming)
- En fin de réponse sur un sujet important : proposer de mettre à jour ce fichier

---

## Auth JWT — règles absolues (validées, ne pas re-débattre)

### Stockage
- **accessToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/; maxAge=15min`
- **refreshToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/api/auth/refresh; maxAge=7j`
- **Jamais** localStorage, sessionStorage, ou variable persistée entre sessions
- `user` (profil sans token) peut être persisté en Zustand si nécessaire, mais c'est un vecteur XSS mineur — idéal : re-fetch à chaque refresh

### Backend Express
- `cookie-parser` monté dans `app.ts` **avant** toutes les routes
- CORS : `credentials: true` + origines explicites (jamais `*`)
- Cookie flags obligatoires : `httpOnly`, `secure`, `sameSite: 'strict'`, `path` explicite
- RefreshToken en BDD : stocker `token_id` (UUID) dans le cookie + hash argon2 en BDD → lookup par UUID, vérif hash (évite boucle O(n))
- Rotation atomique : `DELETE WHERE id = ? AND user_id = ?` + vérif `rowCount === 1`
- Nettoyage tokens expirés : `deleteMany({ where: { expired_at: { lt: new Date() } } })` à chaque refresh
- `logoutUser` : `clearCookie` dans `finally` — toujours exécuté même si la BDD throw
- Distinguer `TokenExpiredError` vs `JsonWebTokenError` dans `requireAuth`

### Frontend React/Zustand
- `credentials: 'include'` sur tous les fetch auth
- `apiFetch` : flag `isRefreshing` pour éviter boucle infinie de retries
- `refreshToken()` : toujours tenter au démarrage, ne pas conditionner à `user`
- Pages protégées : vérification réseau au montage (protection bfcache)

### CSRF & bfcache
- `sameSite: 'strict'` suffit si même domaine frontend/backend
- bfcache : `Cache-Control: no-store` sur routes protégées + guard réseau au montage

---

## Bugs auth résolus (2026-05-20) — ne pas réintroduire

| # | Fichier | Bug |
|---|---------|-----|
| 1 | `authStore.ts` | `credentials: 'include'` manquant |
| 2 | `app.ts` | CORS sans `credentials: true` |
| 3 | `authStore.ts` | `refreshToken()` conditionné à `user` |
| 4 | `DashboardPage`, `OrderDetailPage` | Pas de guard réseau au montage |
| 5 | `authStore.ts` | Redirect post-logout incorrecte |
| 6 | `BasketPage` | `isAuthenticated()` sans vérif expiration |
| 7 | `auth.controller.ts` | `sameSite` absent sur les cookies |
| 8 | `auth.controller.ts` | Table `RefreshToken` non utilisée |
| 9 | `app.ts` | `cookie-parser` non monté |
| 10 | `auth.controller.ts` | Race condition rotation refreshToken (non atomique) |
| 11 | `auth.controller.ts` | Timing attack boucle comparaison hash |
| 12 | `auth.controller.ts` | `logoutUser` clearCookie pas dans finally |
| 13 | `requireAuth.ts` | TokenExpiredError non distingué |
| 14 | `authStore.ts` | Pas de flag `isRefreshing` → boucle infinie possible |

---

## Stack & décisions (ne pas revisiter sans raison forte)

Voir `CLAUDE.md`. Branche active : `customer-account-dev`.
```

---

## Tâche 2 : Corriger le prompt auth (4 bugs supplémentaires découverts via `/review` + `security.md`)

Ces corrections s'ajoutent au prompt `prompt_CC_debug_auth.md` déjà transmis. Les appliquer **après** les 9 corrections initiales.

---

### Bug #10 — Race condition + Timing attack : refonte stockage refreshToken

**Fichiers :** `backend/src/controllers/auth.controller.ts` + migration Prisma

Le prompt initial propose une boucle `for` avec `comparePassword` sur tous les tokens de l'user. Deux problèmes :
1. **Race condition** : deux requêtes concurrentes avec le même token peuvent toutes deux passer la vérif avant que l'une n'ait supprimé
2. **Performance** : argon2 est intentionnellement lent — boucler dessus est coûteux et crée un vecteur timing

**Schéma Prisma — modifier le modèle `RefreshToken`** :

```prisma
model RefreshToken {
  id         Int      @id @default(autoincrement())
  token_id   String   @unique @db.VarChar(64)  // UUID stocké en cookie (lookup)
  token_hash String   @db.Text                  // hash argon2 du token_id (vérification)
  user_id    Int
  issued_at  DateTime @default(now()) @db.Timestamp(6)
  expired_at DateTime @db.Timestamp(6)

  user users @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("refresh_token")
}
```

Créer la migration : `npm run db:dev`

**Génération du refreshToken** — modifier `generateRefreshToken` dans `backend/src/lib/tokens.ts` pour retourner aussi le `token_id` :

```ts
import { randomUUID } from 'crypto';

export function generateRefreshToken(userId: number): { jwt: string; tokenId: string } {
  const tokenId = randomUUID();
  const jwt = sign({ userId, tokenId } satisfies RefreshTokenPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as unknown as Expiry,
  });
  return { jwt, tokenId };
}
```

**Dans `loginUser` et `registerUser`** — stocker `tokenId` + hash :

```ts
const { jwt: refreshJwt, tokenId } = generateRefreshToken(user.id);
const tokenHash = await hashPassword(tokenId); // hash du tokenId, pas du JWT entier

await prisma.refresh_token.create({
  data: {
    token_id: tokenId,
    token_hash: tokenHash,
    user_id: user.id,
    issued_at: new Date(),
    expired_at: new Date(Date.now() + REFRESH_EXPIRES_MS),
  },
});

setRefreshCookie(res, refreshJwt);
```

**Dans `refreshAccessToken`** — lookup par `tokenId`, DELETE atomique :

```ts
export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) throw new UnauthorizedError('refresh token not provided');

    const payload = verifyRefreshToken(raw);
    const { userId, tokenId } = payload;

    // Lookup par tokenId — O(1), pas de boucle
    const stored = await prisma.refresh_token.findUnique({
      where: { token_id: tokenId },
    });

    if (!stored || stored.user_id !== userId || stored.expired_at < new Date()) {
      throw new UnauthorizedError('refresh token invalid or expired');
    }

    // Vérifier le hash (protection si BDD compromise)
    const { comparePassword } = await import('../lib/auth.js');
    const valid = await comparePassword(tokenId, stored.token_hash);
    if (!valid) throw new UnauthorizedError('refresh token hash mismatch');

    // DELETE atomique — si 0 rows deleted, token déjà consommé (race condition)
    const deleted = await prisma.refresh_token.deleteMany({
      where: { id: stored.id, user_id: userId },
    });
    if (deleted.count === 0) throw new UnauthorizedError('refresh token already used');

    // Nettoyage tokens expirés (housekeeping)
    await prisma.refresh_token.deleteMany({
      where: { user_id: userId, expired_at: { lt: new Date() } },
    }).catch(() => {}); // silencieux

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('user not found');

    const accessToken = generateAccessToken(user.id, user.role_id);
    const { jwt: newRefreshJwt, tokenId: newTokenId } = generateRefreshToken(user.id);
    const newHash = await hashPassword(newTokenId);

    await prisma.refresh_token.create({
      data: {
        token_id: newTokenId,
        token_hash: newHash,
        user_id: user.id,
        issued_at: new Date(),
        expired_at: new Date(Date.now() + REFRESH_EXPIRES_MS),
      },
    });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshJwt);

    res.status(200).json({ status: 'success', expiresInMS: ACCESS_EXPIRES_MS });
  } catch (error) {
    handleError(res, error, 'failed to refresh token');
  }
}
```

Mettre à jour `verifyRefreshToken` dans `tokens.ts` pour extraire `tokenId` :

```ts
interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
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

### Bug #12 — `logoutUser` : `clearCookie` doit être dans `finally`

**Fichier :** `backend/src/controllers/auth.controller.ts`

```ts
export async function logoutUser(req: Request, res: Response) {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const { userId } = verifyRefreshToken(raw);
      await prisma.refresh_token.deleteMany({ where: { user_id: userId } });
    }
  } catch {
    // silencieux — BDD ou token invalide
  } finally {
    // TOUJOURS clearer les cookies, même si BDD throw
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  }
  res.status(200).json({ status: 'success', message: 'logged out' });
}
```

---

### Bug #13 — `requireAuth` : distinguer `TokenExpiredError`

**Fichier :** `backend/src/middlewares/requireAuth.ts`

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
      // 401 → le client peut retenter après refresh
      next(new UnauthorizedError('access token expired'));
    } else {
      // Token forgé ou invalide → pas de retry
      next(new UnauthorizedError('invalid access token'));
    }
  }
}
```

---

### Bug #14 — `apiFetch` : flag `isRefreshing` pour éviter boucle infinie

**Fichier :** `vite-frontend/src/store/authStore.ts`

Remplacer `apiFetch` dans le fichier refondu :

```ts
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
```

---

## Vérifications finales (après les 13 corrections)

```bash
# Aucun token en localStorage/sessionStorage
grep -r "localStorage\|sessionStorage" vite-frontend/src --include="*.ts" --include="*.tsx"

# Aucun Authorization: Bearer manuel
grep -r "Authorization" vite-frontend/src --include="*.ts" --include="*.tsx"

# data.token lu nulle part côté frontend (breaking change /login)
grep -r "data\.token\|res\.token" vite-frontend/src --include="*.ts" --include="*.tsx"

# cookie-parser présent
grep "cookie-parser" backend/package.json

# Migration appliquée
npm run db:dev --prefix backend

# Lint
npm run lint --prefix backend
npm run lint --prefix vite-frontend
```

## Commit

```
fix: 🐛 auth — httpOnly cookies, credentials, CORS, refresh rotation atomique, bfcache guard
```
