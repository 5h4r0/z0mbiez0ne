# auth.md — Règles JWT zombiezone
> Charger pour toute tâche auth, cookies, tokens, login, logout, refresh, middleware requireAuth.

---

## Stockage des tokens — règle absolue

- **Jamais** localStorage, sessionStorage, variable JS persistée
- **accessToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/; maxAge=15min`
- **refreshToken** : cookie `httpOnly; Secure; SameSite=Strict; path=/api/auth/refresh; maxAge=7j`
- Le frontend ne lit jamais les tokens — le browser les joint automatiquement

---

## Backend Express

- `cookie-parser` monté dans `app.ts` **avant** toutes les routes et avant `express.json()`
- CORS : `credentials: true` + origines explicites — jamais `*`
- Cookie flags obligatoires sur chaque `Set-Cookie` : `httpOnly`, `secure`, `sameSite: 'strict'`, `path` explicite

### RefreshToken en BDD (Prisma)
- Schéma : `token_id` (UUID — dans le cookie) + `token_hash` (argon2 — en BDD)
- Jamais le token brut en BDD
- Lookup : `findFirst({ where: { token_id } })` puis `argon2.verify(token_hash, tokenFromCookie)`
- Rotation atomique : `DELETE WHERE id = ? AND user_id = ?` + vérif `rowCount === 1`
- Nettoyage à chaque refresh : `deleteMany({ where: { expired_at: { lt: new Date() } } })`

### logoutUser
```ts
try {
  await prisma.refreshToken.deleteMany({ where: { user_id } })
} finally {
  res.clearCookie('accessToken', { path: '/' })
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' })
}
```
`clearCookie` dans `finally` — garanti même si BDD throw.

### requireAuth middleware
- Distinguer `TokenExpiredError` vs `JsonWebTokenError`
- `TokenExpiredError` → 401 `{ code: 'TOKEN_EXPIRED' }` (le frontend tentera un refresh)
- `JsonWebTokenError` → 401 `{ code: 'INVALID_TOKEN' }` (redirect login)

---

## Frontend React/Zustand

- `credentials: 'include'` sur **tous** les fetch auth : login, logout, refresh
- `refreshToken()` : toujours tenter au démarrage — ne pas conditionner à `user !== null`
- `apiFetch` : flag `isRefreshing` pour éviter boucle infinie sur 401
- Pages protégées : vérification réseau au montage (protection bfcache — le bouton précédent ne bypass pas l'auth)

---

## CSRF & bfcache

- `sameSite: 'strict'` suffit — frontend et backend sur le même domaine `sharo.fr`
- `Cache-Control: no-store` sur toutes les réponses des routes protégées
- Si cross-domain un jour : double submit cookie pattern

---

## Décisions validées (2026-05-20)

- `token` → `token_id` + `token_hash` dans le schema Prisma ✅
- `generateRefreshToken` retourne `{ jwt, tokenId }` ✅
- `persistRefreshToken` + `setAccessCookie` extraits en helpers dans `auth.controller.ts` ✅
- Token JWT retiré de Zustand ✅
- Flag `isRefreshing` dans `apiFetch` ✅
