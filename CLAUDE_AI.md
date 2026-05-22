# CLAUDE_AI.md
> Référence de session pour claude.ai — décisions validées, règles projet, patterns approuvés.

---

## Accès au repo

```bash
git clone https://github.com/5h4r0/z0mbiez0ne.git /tmp/zz
cd /tmp/zz && git checkout customer-account-dev
```

Toujours cloner et lire les fichiers concernés avant d'analyser ou proposer une correction.
Vérifier d'abord : `test -d /tmp/zz && echo exists` — ne pas recloner si présent.

## gstack

Ne pas cloner par défaut. Demander à Steph si le sujet est complexe (sécu, archi, debug non trivial).

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git /tmp/gstack
```

---

## Règles de réponse

- Toujours préfixer les fichiers avec leur chemin relatif au monorepo
- Appliquer les bonnes pratiques d'office — ne pas attendre qu'on les demande
- En fin de réponse sur un sujet important : proposer de mettre à jour ce fichier

---

## Auth JWT — règles absolues (validées, ne pas re-débattre)

### Stockage
- **accessToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/; maxAge=15min`
- **refreshToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/api/auth/refresh; maxAge=7j`
- **Jamais** localStorage, sessionStorage, ou variable persistée entre sessions

### Backend Express
- `cookie-parser` monté dans `app.ts` **avant** toutes les routes
- CORS : `credentials: true` + origines explicites (jamais `*`)
- Cookie flags obligatoires : `httpOnly`, `secure`, `sameSite: 'strict'`, `path` explicite
- RefreshToken en BDD : `token_id` (UUID dans cookie) + `token_hash` (argon2 en BDD) — lookup O(1)
- Rotation atomique : `DELETE WHERE id = ? AND user_id = ?` + vérif `rowCount === 1`
- Nettoyage tokens expirés : `deleteMany({ where: { expired_at: { lt: new Date() } } })` à chaque refresh
- `logoutUser` : `clearCookie` dans `finally` — garanti même si BDD throw
- `requireAuth` : distingue `TokenExpiredError` vs `JsonWebTokenError`

### Frontend React/Zustand
- `credentials: 'include'` sur tous les fetch auth
- `apiFetch` : flag `isRefreshing` pour éviter boucle infinie de retries
- `refreshToken()` : toujours tenter au démarrage, ne pas conditionner à `user`
- Pages protégées : vérification réseau au montage (protection bfcache)

### CSRF & bfcache
- `sameSite: 'strict'` suffit si même domaine frontend/backend
- `Cache-Control: no-store` sur routes protégées + guard réseau au montage

---

## Stack (ne pas revisiter sans raison forte)

Express 5 · Prisma · PostgreSQL · argon2 · date-fns · JWT · Biome · NPM workspaces · Vite · Zustand · Docker
React Router v7 (pas `react-router-dom`) · React 19 · TypeScript strict (pas de `any`) · Soft delete (`deleted_at`)

---

## Décisions validées — 2026-05-20 : Auth JWT

### Backend — 10 corrections appliquées
- `cookie-parser` installé + monté **avant** `express.json()` dans `app.ts`
- CORS : `credentials: true` + origines explicites (`config/cors.ts` supprimé)
- Cookies auth : `sameSite: 'strict'` + `httpOnly` + `secure` sur tous les `Set-Cookie`
- `RefreshToken` schema : `token` → `token_id` (UUID) + `token_hash` (argon2)
- `generateRefreshToken` retourne `{ jwt, tokenId }` — lookup O(1)
- Rotation atomique + vérif `rowCount === 1`
- `persistRefreshToken` + `setAccessCookie` extraits en helpers dans `auth.controller.ts`
- `logoutUser` : `clearCookie` dans `finally`
- `requireAuth` : lit cookie httpOnly, distingue `TokenExpiredError` vs `JsonWebTokenError`

### Frontend — 5 corrections appliquées
- Token JWT retiré de Zustand, `credentials: 'include'` sur tous les fetch auth
- `refreshToken()` sans condition sur `user`
- Flag `isRefreshing` dans `apiFetch`
- Redirection post-logout vers `/`
- `OrderDetailPage.tsx` : guard réseau au montage (bfcache)