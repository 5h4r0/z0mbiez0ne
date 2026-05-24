# CLAUDE_AI_overloaded

## /!\ Attention : à utiliser à la demande de Steph 
> Référence de session pour claude.ai — décisions validées, règles projet, patterns approuvés.
> À cloner au début de chaque discussion importante.

---

## Accès au repo

```bash
# Vérifier d'abord si le clone existe déjà dans la session bash courante - example branche customer-account-dev
test -d /tmp/zz && echo "exists" || git clone --depth 1 -b customer-account-dev https://github.com/5h4r0/z0mbiez0ne.git /tmp/zz
```

**RÈGLE CLONE** : cloner UNE SEULE FOIS par discussion dans `/tmp/zz`. Le répertoire persiste pendant toute la session bash. Ne jamais recloner si `/tmp/zz` existe déjà.

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

## Zod — règle absolue : lire le controller, pas le schema Prisma

Quand on écrit un schéma Zod pour parser une réponse API :
- **Toujours lire le controller concerné** avant d'écrire le schéma
- **Jamais inférer depuis schema.prisma** — le controller transforme les données :
  - `Decimal` Prisma → `number` (ex: unit_price, total_amount)
  - `Date` Prisma → `string` formatée par date-fns (ex: session.date)
  - Relations → aplaties ou restructurées (ex: role object → role string)
  - Champs calculés absents du modèle (ex: available_capacity)
- Le contrat API = la sortie du controller, pas le modèle BDD

Violation détectée le 2026-05-24 :
- manageSessionSchema : unit_price z.string() au lieu de z.number()
- manageSessionSchema : date attendue ISO, reçue string formatée date-fns
- manageUserSchema : role z.object({id, name}) au lieu de z.string()

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
- Pages protégées : guard réseau au montage (protection bfcache) — voir ci-dessous

### Guard réseau (bfcache)
Un **guard réseau au montage** = `useEffect` qui appelle l'API au chargement pour vérifier la session côté serveur avant d'afficher le contenu protégé. Sans ça, le bouton "précédent" du navigateur restaure la page depuis la mémoire (bfcache) sans re-exécuter le JS — le `user` Zustand semble valide mais la session est peut-être expirée.
- `OrderDetailPage.tsx` : guard présent ✅
- `DashboardPage.tsx` : guard absent ⚠️ — à corriger

### CSRF & bfcache
- `sameSite: 'strict'` suffit si même domaine frontend/backend
- bfcache : `Cache-Control: no-store` sur routes protégées + guard réseau au montage

---

## Stack & décisions (ne pas revisiter sans raison forte)

Voir `CLAUDE.md` — source de vérité pour la stack, les commandes, les conventions.

---

## Tests — Décisions validées (Session 2026-05-22)

### Runner : Vitest (pas Jest)
- Stack ESM pure (`"type": "module"`) + TypeScript + Vite → Vitest est natif, pas de Babel ni `--experimental-vm-modules`
- Syntaxe identique à Jest — migration triviale
- `@vitest/coverage-v8` pour le coverage (plus rapide qu'Istanbul)

### Stratégie : Testing Diamond (Goldberg)
- **Majorité** : component tests — appel HTTP réel via supertest → PostgreSQL de test réelle
- **Peu** : unit tests (uniquement logique non-triviale isolée)
- **Très peu** : E2E (config, infra, services tiers)
- Ne pas mocker Prisma — tester contre une vraie DB en `tmpfs`

### Infrastructure de test
- `docker-compose.test.yml` dédié — PostgreSQL sur port `54320`, données en `tmpfs` (RAM, ~3x plus rapide)
- `globalSetup.ts` : démarre le conteneur + `prisma migrate deploy` une seule fois
- `testSetup.ts` : `beforeEach` → `deleteMany` dans l'ordre FK (RefreshToken → orders_lines → orders → users)
- Conteneur laissé vivant en local (redémarrage en 3ms), arrêté en CI (`process.env.CI === 'true'`)
- `singleFork: true` dans vitest.config — 1 worker pour éviter les race conditions BDD

### Fichiers de setup
```
backend/src/tests/
  setup/
    globalSetup.ts    — démarre Docker + migrations
    testSetup.ts      — nettoyage BDD beforeEach
    testApp.ts        — exporte app Express sans démarrer le serveur HTTP
    factories.ts      — createUser(), loginUser() — chaque test crée ses propres données
  auth/
    register.test.ts
    login.test.ts
    logout.test.ts
    refresh.test.ts
    profile.test.ts
```

### Ordre des imports — règle critique
Dans `testApp.ts` : `dotenv.config({ path: '.env.test' })` **avant** `import { app }`.
`config.ts` se charge au premier import — si l'env est vide, les secrets JWT restent aux valeurs par défaut.

### Exit doors à couvrir (Goldberg §1.5)
Pour chaque endpoint : réponse HTTP, état BDD, cookies posés/effacés.
Le test replay attack sur `/refresh` est le plus critique — valide la rotation atomique.

### Scripts package.json backend
```json
"test": "dotenv -e .env.test -- vitest run",
"test:watch": "dotenv -e .env.test -- vitest",
"test:coverage": "dotenv -e .env.test -- vitest run --coverage"
```

---

## Flux de données — Cartographie (Session 2026-05-22)

### Zones
| Zone | Routes frontend | API concernée |
|---|---|---|
| Public | `/`, `/sessions`, `/les-epreuves`, `/categories-epreuves`, `/:slug` | activities, sessions, categories (GET public), auth (login/register/refresh) |
| Dashboard | `/dashboard`, `/dashboard/commandes/:id` | auth (logout, profile), orders (mine, :id, PUT) |
| Manage | `/manage` | **Non implémenté frontend** — tous les endpoints admin existent côté API |

### Hooks et fetch
- `useFetch` (hook) : routes publiques uniquement — pas de `credentials`, pas de gestion 401
- `apiFetch` (authStore) : routes authentifiées — gère refresh automatique sur 401, `credentials: 'include'`
- `fetch` natif : utilisé dans ActivityDetailPage, SessionDetailPage, CategoryDetailPage, DynamicDetailPage — pas de `credentials` (OK tant que ces routes restent publiques)

### Anomalies connues à corriger
| # | Fichier | Description | Priorité |
|---|---|---|---|
| 1 | `orders.controller.ts → getOrder()` | `GET /api/orders/:id` ne filtre pas par `user_id` — un membre peut lire la commande d'un autre par id | **Haute** |
| 2 | `DashboardPage.tsx` | Guard réseau absent au montage — risque bfcache | Moyenne |
| 3 | `authStore.ts → register()` | Hydrate `store.user` depuis le body sans re-fetch `/profile` — asymétrique avec `login()` | Basse |
| 4 | `BasketPage.tsx` + `basketStore.ts` | Panier complet en local mais `POST /api/orders` jamais appelé — flux de commande manquant | Haute |
| 5 | `DashboardPage.tsx` | `role_id: 1` hardcodé — convention à documenter : `1=member` est stable par convention seed | Info |

### Convention rôles (stable, ne pas changer)
- `role_id: 1` = `member` (utilisateur standard)
- `role_id: 2` = `admin` (backoffice `/manage`)
- Ces ids sont stables par convention dans le seeding — ne jamais les modifier

---

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
