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

## Stack & décisions (ne pas revisiter sans raison forte)

Voir `CLAUDE.md` — source de vérité pour la stack, les commandes, les conventions.


## Décisions validées — Session 2026-05-20 : Auth JWT

### Backend — 10 corrections appliquées
- `cookie-parser` installé + monté **avant** `express.json()` dans `app.ts`
- CORS : `credentials: true` + origines explicites (config inline dans `app.ts`, `config/cors.ts` supprimé)
- Cookies auth : `sameSite: 'strict'` + `httpOnly` + `secure` sur tous les `Set-Cookie`
- `RefreshToken` schema : `token` → `token_id` (UUID stocké dans cookie) + `token_hash` (argon2 en BDD)
- `generateRefreshToken` retourne `{ jwt, tokenId }` — lookup O(1) par UUID, pas de boucle argon2
- Rotation atomique : `DELETE WHERE id = ? AND user_id = ?` + vérif `rowCount === 1`
- `persistRefreshToken` + `setAccessCookie` extraits en helpers dans `auth.controller.ts`
- `logoutUser` : `clearCookie` dans `finally` — garanti même si la BDD throw
- `requireAuth` : lit le cookie httpOnly (plus `Authorization: Bearer`)
- `requireAuth` : distingue `TokenExpiredError` vs `JsonWebTokenError`

### Frontend — 4 corrections appliquées
- `authStore.ts` : token JWT retiré de la mémoire Zustand, `credentials: 'include'` sur tous les fetch auth
- `authStore.ts` : `refreshToken()` sans condition sur `user` — restauration session au démarrage
- `authStore.ts` : flag `isRefreshing` dans `apiFetch` — évite boucle infinie sur 401 simultanés
- `authStore.ts` : redirection post-logout vers `/` (plus `/dashboard`)
- `OrderDetailPage.tsx` : guard réseau au montage — protection bfcache