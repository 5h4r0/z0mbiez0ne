# Flux de données — zombiezone.kadath.fr
> Branche `customer-account-dev` — état au 2026-05-22
> Trois lectures : D (tableaux + anomalies), C (diagrammes ASCII), B (flux narratif par type)

---

## PARTIE D — Tableaux par zone + observations

---

### Zone 1 — Site public (`/`, `/sessions`, `/les-epreuves`, `/categories-epreuves`, `/:slug`)

#### Activities

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `ActivitiesPage` | `pages/ActivitiesPage.tsx` | `useFetch` | `GET /api/activities?limit=12&page=N` | `routers/activities.router.ts` | aucun | `activities.controller.ts → getActivities` |
| `ActivityDetailPage` | `pages/ActivityDetailPage.tsx` | `fetch` natif | `GET /api/activities/by-slug/:slug` | `routers/activities.router.ts` | aucun | `activities.controller.ts → getActivityBySlug` |
| `ActivityDetailPage` | `pages/ActivityDetailPage.tsx` | `fetch` natif | `GET /api/sessions?activity_slug=X&status=Scheduled&limit=6` | `routers/sessions.router.ts` | aucun | `sessions.controller.ts → getSessions` |
| `HomePage` | `pages/HomePage.tsx` | `useFetch` | `GET /api/activities?limit=4` | `routers/activities.router.ts` | aucun | `activities.controller.ts → getActivities` |
| `DynamicDetailPage` | `pages/DynamicDetailPage.tsx` | `fetch` natif | `GET /api/activities/by-slug/:slug` | `routers/activities.router.ts` | aucun | `activities.controller.ts → getActivityBySlug` |

#### Sessions

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `SessionsPage` | `pages/SessionsPage.tsx` | `useFetch` | `GET /api/sessions?limit=12&page=N&sort=date&order=asc[&status=X]` | `routers/sessions.router.ts` | aucun | `sessions.controller.ts → getSessions` |
| `SessionDetailPage` | `pages/SessionDetailPage.tsx` | `fetch` natif | `GET /api/sessions/:id` | `routers/sessions.router.ts` | aucun | `sessions.controller.ts → getSession` |
| `HomePage` | `pages/HomePage.tsx` | `useFetch` | `GET /api/sessions?status=Scheduled&limit=4&sort=date&order=asc` | `routers/sessions.router.ts` | aucun | `sessions.controller.ts → getSessions` |

#### Categories

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `CategoriesPage` | `pages/CategoriesPage.tsx` | `useFetch` | `GET /api/categories?limit=12&page=N` | `routers/categories.router.ts` | aucun | `categories.controller.ts → getCategories` |
| `CategoryDetailPage` | `pages/CategoryDetailPage.tsx` | `fetch` natif | `GET /api/categories/by-slug/:slug` | `routers/categories.router.ts` | aucun | `categories.controller.ts → getCategoryBySlug` |
| `CategoryDetailPage` | `pages/CategoryDetailPage.tsx` | `fetch` natif | `GET /api/activities?category_slug=X&limit=12` | `routers/activities.router.ts` | aucun | `activities.controller.ts → getActivities` |
| `HomePage` | `pages/HomePage.tsx` | `useFetch` | `GET /api/categories?limit=4` | `routers/categories.router.ts` | aucun | `categories.controller.ts → getCategories` |
| `DynamicDetailPage` | `pages/DynamicDetailPage.tsx` | `fetch` natif | `GET /api/categories/by-slug/:slug` | `routers/categories.router.ts` | aucun | `categories.controller.ts → getCategoryBySlug` |

#### Auth (public — non authentifié)

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `DashboardPage` (formulaire login) | `pages/dashboard/DashboardPage.tsx` | `store.login()` → `fetch` | `POST /api/auth/login` | `routers/auth.router.ts` | aucun | `auth.controller.ts → loginUser` |
| `DashboardPage` (formulaire login) | `pages/dashboard/DashboardPage.tsx` | `store.login()` → `fetch` | `GET /api/auth/profile` | `routers/auth.router.ts` | `requireAuth` | `auth.controller.ts → getAuthenticatedUser` |
| `DashboardPage` (formulaire register) | `pages/dashboard/DashboardPage.tsx` | `store.register()` → `fetch` | `POST /api/auth/register` | `routers/auth.router.ts` | aucun | `auth.controller.ts → registerUser` |
| `App.tsx` (montage) | `components/App.tsx` | `store.refreshToken()` → `fetch` | `POST /api/auth/refresh` | `routers/auth.router.ts` | aucun (lit cookie httpOnly) | `auth.controller.ts → refreshAccessToken` |
| `App.tsx` (montage, si refresh OK) | `components/App.tsx` | `store.refreshToken()` → `fetch` | `GET /api/auth/profile` | `routers/auth.router.ts` | `requireAuth` | `auth.controller.ts → getAuthenticatedUser` |

---

### Zone 2 — Espace client (`/dashboard`, `/dashboard/commandes/:id`)

#### Auth (authentifié)

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `DashboardPage` (bouton déconnexion) | `pages/dashboard/DashboardPage.tsx` | `store.logout()` → `fetch` | `POST /api/auth/logout` | `routers/auth.router.ts` | aucun | `auth.controller.ts → logoutUser` |
| `OrderDetailPage` (guard bfcache) | `pages/dashboard/OrderDetailPage.tsx` | `useEffect` → redirect si `!user` | — | — | — | — |

#### Orders

| Page frontend | Fichier | Appel | Endpoint | Router | Middleware | Controller |
|---|---|---|---|---|---|---|
| `DashboardPage` | `pages/dashboard/DashboardPage.tsx` | `apiFetch` | `GET /api/orders/mine` | `routers/orders.router.ts` | `requireAuth` + `requireRole('member','admin')` | `orders.controller.ts → getMyOrders` |
| `OrderDetailPage` | `pages/dashboard/OrderDetailPage.tsx` | `apiFetch` | `GET /api/orders/:id` | `routers/orders.router.ts` | `requireAuth` + `requireRole('member','admin')` | `orders.controller.ts → getOrder` |
| `OrderDetailPage` (payer) | `pages/dashboard/OrderDetailPage.tsx` | `apiFetch` | `PUT /api/orders/:id` `{ status: 'Confirmed' }` | `routers/orders.router.ts` | `requireAuth` + `requireRole('member','admin')` | `orders.controller.ts → updateOrder` |
| `OrderDetailPage` (annuler) | `pages/dashboard/OrderDetailPage.tsx` | `apiFetch` | `PUT /api/orders/:id` `{ status: 'Cancelled' }` | `routers/orders.router.ts` | `requireAuth` + `requireRole('member','admin')` | `orders.controller.ts → updateOrder` |

---

### Zone 3 — Backoffice admin (`/manage`)

> ⚠️ **Cette zone n'existe pas dans le frontend.** Aucune page, aucune route, aucun composant lié à `/manage` n'est présent dans `vite-frontend/src/`. Les endpoints admin sont câblés côté backend (activities, sessions, categories, orders, users, roles avec `requireRole('admin')`), mais sans interface frontend associée.

| Endpoint disponible côté API | Router | Middleware | Controller | Frontend |
|---|---|---|---|---|
| `POST /api/activities` | `activities.router.ts` | `requireAuth` + `requireRole('admin')` | `createActivity` | ❌ absent |
| `PUT /api/activities/:id` | `activities.router.ts` | `requireAuth` + `requireRole('admin')` | `updateActivity` | ❌ absent |
| `DELETE /api/activities/:id` | `activities.router.ts` | `requireAuth` + `requireRole('admin')` | `deleteActivity` | ❌ absent |
| `POST /api/sessions` | `sessions.router.ts` | `requireAuth` + `requireRole('admin')` | `createSession` | ❌ absent |
| `PUT /api/sessions/:id` | `sessions.router.ts` | `requireAuth` + `requireRole('admin')` | `updateSession` | ❌ absent |
| `DELETE /api/sessions/:id` | `sessions.router.ts` | `requireAuth` + `requireRole('admin')` | `deleteSession` | ❌ absent |
| `POST /api/categories` | `categories.router.ts` | `requireAuth` + `requireRole('admin')` | `createCategory` | ❌ absent |
| `PUT /api/categories/:id` | `categories.router.ts` | `requireAuth` + `requireRole('admin')` | `updateCategory` | ❌ absent |
| `DELETE /api/categories/:id` | `categories.router.ts` | `requireAuth` + `requireRole('admin')` | `deleteCategory` | ❌ absent |
| `GET /api/orders` | `orders.router.ts` | `requireAuth` + `requireRole('admin')` | `getOrders` | ❌ absent |
| `GET /api/users` | `users.router.ts` | `requireAuth` + `requireRole('admin')` | `getUsers` | ❌ absent |
| `GET /api/orders_lines` | `order.lines.router.ts` | `requireAuth` + `requireRole('admin')` | `getOrdersLines` | ❌ absent |

---

### Observations et anomalies

| # | Fichier(s) concerné(s) | Type | Description |
|---|---|---|---|
| 1 | `pages/ActivityDetailPage.tsx`, `pages/SessionDetailPage.tsx`, `pages/CategoryDetailPage.tsx`, `pages/DynamicDetailPage.tsx` | **Incohérence** | Ces pages utilisent `fetch` natif sans `credentials: 'include'`. Pour l'instant les endpoints ciblés sont publics donc pas de bug, mais si l'un d'eux devient protégé le cookie ne sera pas joint automatiquement. À remplacer par `apiFetch`. |
| 2 | `hooks/useFetch.ts` | **Incohérence** | `useFetch` n'utilise pas `credentials: 'include'` et ne gère pas les 401. Acceptable pour les routes publiques uniquement. Toute utilisation sur une route protégée sera silencieusement cassée. |
| 3 | `store/basketStore.ts` | **Incomplet** | `basketStore` est défini (items, qty, prix) mais `BasketPage` est vide et commentée dans le routing. Aucun appel API `POST /api/orders` n'est câblé depuis le panier. Le flux "ajout panier → création commande" est manquant. |
| 4 | `pages/dashboard/DashboardPage.tsx` | **Logique** | Le guard bfcache est absent sur `DashboardPage` : si `user` est null et `isHydrating` est false, la page affiche le formulaire de login sans vérification réseau au montage. `OrderDetailPage` a ce guard (`useEffect` → redirect si `!user`), mais `DashboardPage` non. |
| 5 | `store/authStore.ts` | **Sécurité mineure** | `persist` de Zustand stocke `user` (id, firstname, lastname, email, role_id) dans `localStorage` sous la clé `zz-auth`. Ce n'est pas un token JWT, donc pas de risque d'exfiltration de credentials, mais c'est un vecteur XSS pour l'identité de l'utilisateur. Le profil pourrait être re-fetché à chaque refresh plutôt que persisté. |
| 6 | `store/basketStore.ts` | **Sécurité mineure** | `basketStore` utilise `persist` sans clé `partialize` : tout le store est sérialisé en `localStorage`. Si des prix ou des IDs de session sont manipulés côté client, la validation backend (`createOrder` → vérif capacity + prix recalculé en BDD) protège correctement. Pas de risque fonctionnel, mais la donnée panier en localStorage est modifiable par XSS. |
| 7 | `controllers/orders.controller.ts` | **TODO critique** | `updateOrder` (statut → `Confirmed`) simule un paiement sans Stripe. Un commentaire `TODO` est présent. Le flux "payer" actuel ne valide aucun paiement réel. |
| 8 | `pages/` (manage) | **Manquant** | Aucune page `/manage` ni backoffice admin n'est implémentée frontend. Tous les endpoints `admin` sont exposés API sans interface. |

---

## PARTIE C — Diagrammes ASCII par zone

Légende :
- `→` flux de données
- `[MW]` middleware
- `(public)` / `(auth)` / `(admin)` = niveau d'accès
- `~~` = non implémenté

---

### Zone 1 — Site public

```
ACTIVITIES
──────────────────────────────────────────────────────────────────────────────
ActivitiesPage.tsx
  → useFetch('/api/activities?limit=12&page=N')
  → hooks/useFetch.ts  [fetch natif, pas de credentials]
  → GET /api/activities  (public)
  → routers/activities.router.ts
  → controllers/activities.controller.ts → getActivities()
  → models/index.ts (Prisma)
  → PostgreSQL : activities + activities_categories + categories + sessions + orders_lines + orders + users

ActivityDetailPage.tsx
  → fetch('/api/activities/by-slug/:slug')  [fetch natif]
  → GET /api/activities/by-slug/:slug  (public)
  → routers/activities.router.ts
  → controllers/activities.controller.ts → getActivityBySlug()
  → PostgreSQL : activities + activities_categories + sessions + orders_lines + orders + users

ActivityDetailPage.tsx  (sessions de l'activité)
  → fetch('/api/sessions?activity_slug=X&status=Scheduled&limit=6')  [fetch natif]
  → GET /api/sessions  (public)
  → routers/sessions.router.ts
  → controllers/sessions.controller.ts → getSessions()
  → PostgreSQL : sessions + activity + orders_lines + orders + users

HomePage.tsx
  → useFetch('/api/activities?limit=4')
  → GET /api/activities  (public)
  → routers/activities.router.ts
  → controllers/activities.controller.ts → getActivities()
  → PostgreSQL : activities + categories + sessions + orders_lines

DynamicDetailPage.tsx
  → fetch('/api/activities/by-slug/:slug')  [fetch natif, tentative 1]
  → GET /api/activities/by-slug/:slug  (public)
  → si 404 : fetch('/api/categories/by-slug/:slug')  [tentative 2]
  → GET /api/categories/by-slug/:slug  (public)
  → controllers/activities.controller.ts → getActivityBySlug()
  → controllers/categories.controller.ts → getCategoryBySlug()
  → PostgreSQL

SESSIONS
──────────────────────────────────────────────────────────────────────────────
SessionsPage.tsx
  → useFetch('/api/sessions?limit=12&page=N&sort=date&order=asc[&status=X]')
  → GET /api/sessions  (public)
  → routers/sessions.router.ts
  → controllers/sessions.controller.ts → getSessions()
  → PostgreSQL : sessions + activity + orders_lines + orders

SessionDetailPage.tsx
  → fetch('/api/sessions/:id')  [fetch natif]
  → GET /api/sessions/:id  (public)
  → routers/sessions.router.ts
  → controllers/sessions.controller.ts → getSession()
  → PostgreSQL : sessions + activity + orders_lines + orders + users

HomePage.tsx
  → useFetch('/api/sessions?status=Scheduled&limit=4&sort=date&order=asc')
  → GET /api/sessions  (public)
  → controllers/sessions.controller.ts → getSessions()

CATEGORIES
──────────────────────────────────────────────────────────────────────────────
CategoriesPage.tsx
  → useFetch('/api/categories?limit=12&page=N')
  → GET /api/categories  (public)
  → routers/categories.router.ts
  → controllers/categories.controller.ts → getCategories()
  → PostgreSQL : categories + activities_categories + activities

CategoryDetailPage.tsx
  → fetch('/api/categories/by-slug/:slug')  [fetch natif]
  → GET /api/categories/by-slug/:slug  (public)
  → controllers/categories.controller.ts → getCategoryBySlug()
  → PostgreSQL

CategoryDetailPage.tsx  (activités de la catégorie)
  → fetch('/api/activities?category_slug=X&limit=12')  [fetch natif]
  → GET /api/activities  (public)
  → controllers/activities.controller.ts → getActivities()
  → PostgreSQL

HomePage.tsx
  → useFetch('/api/categories?limit=4')
  → GET /api/categories  (public)
  → controllers/categories.controller.ts → getCategories()

AUTH — flux de démarrage (App.tsx)
──────────────────────────────────────────────────────────────────────────────
App.tsx  useEffect au montage
  → store/authStore.ts → refreshToken()
  → fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
  → POST /api/auth/refresh  (lit cookie httpOnly refreshToken)
  → routers/auth.router.ts
  → controllers/auth.controller.ts → refreshAccessToken()
  → PostgreSQL : RefreshToken (findUnique → DELETE → create)
  → Set-Cookie: accessToken (httpOnly, 15min) + refreshToken (httpOnly, 7j)
  → si OK : fetch('/api/auth/profile', { credentials: 'include' })
            → GET /api/auth/profile
            → [MW] requireAuth → lit cookie accessToken → req.user
            → controllers/auth.controller.ts → getAuthenticatedUser()
            → PostgreSQL : users (findUnique, omit password_hash)
            → store.set({ user, isHydrating: false })
  → si KO : store.set({ user: null, isHydrating: false })

AUTH — login
──────────────────────────────────────────────────────────────────────────────
DashboardPage.tsx  formulaire login → handleLogin()
  → store/authStore.ts → login(email, password)
  → fetch('/api/auth/login', { method: 'POST', credentials: 'include', body: {email, password} })
  → POST /api/auth/login  (public)
  → controllers/auth.controller.ts → loginUser()
  → lib/auth.ts → comparePassword() [argon2]
  → lib/tokens.ts → generateAccessToken() + generateRefreshToken()
  → PostgreSQL : RefreshToken.create (token_id + token_hash argon2)
  → Set-Cookie: accessToken + refreshToken
  → fetch('/api/auth/profile', { credentials: 'include' })
  → [MW] requireAuth
  → controllers/auth.controller.ts → getAuthenticatedUser()
  → store.set({ user })

AUTH — register
──────────────────────────────────────────────────────────────────────────────
DashboardPage.tsx  formulaire register → handleRegister()
  → store/authStore.ts → register({ firstname, lastname, email, password, confirm })
  → fetch('/api/auth/register', { method: 'POST', credentials: 'include', body: {..., role_id: 1} })
  → POST /api/auth/register  (public)
  → controllers/auth.controller.ts → registerUser()
  → lib/auth.ts → hashPassword() [argon2]
  → PostgreSQL : users.create
  → lib/tokens.ts → generateAccessToken() + generateRefreshToken()
  → PostgreSQL : RefreshToken.create
  → Set-Cookie: accessToken + refreshToken
  → store.set({ user: data.data })
  [note : register ne re-fetche pas /profile — user vient directement du body de réponse]
```

---

### Zone 2 — Espace client (`/dashboard`)

```
AUTH — logout
──────────────────────────────────────────────────────────────────────────────
DashboardPage.tsx  bouton "Se déconnecter"
  → store/authStore.ts → logout()
  → fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  → POST /api/auth/logout  (public — pas de requireAuth)
  → controllers/auth.controller.ts → logoutUser()
  → verifyRefreshToken(raw) → userId
  → PostgreSQL : RefreshToken.deleteMany({ user_id })
  → finally : res.clearCookie('accessToken') + res.clearCookie('refreshToken')
  → store.set({ user: null })

ORDERS — liste
──────────────────────────────────────────────────────────────────────────────
DashboardPage.tsx  useEffect (déclenché quand user !== null)
  → store/authStore.ts → apiFetch('/api/orders/mine')
  → fetch('/api/orders/mine', { credentials: 'include' })
  → si 401 : apiFetch → POST /api/auth/refresh → retry
  → GET /api/orders/mine  (auth)
  → routers/orders.router.ts
  → [MW] requireAuth → lit cookie accessToken → req.user.id
  → [MW] requireRole('member','admin') → PostgreSQL : roles.findUnique
  → controllers/orders.controller.ts → getMyOrders()
  → PostgreSQL : orders.findMany({ where: { user_id: req.user.id } })
                 include orders_lines + session + activity.title
  → { data: Order[] }
  → DashboardPage.tsx → setOrders(d.data)

ORDERS — détail
──────────────────────────────────────────────────────────────────────────────
OrderDetailPage.tsx  useEffect (déclenché au montage)
  → apiFetch('/api/orders/:id')
  → GET /api/orders/:id  (auth)
  → [MW] requireAuth + requireRole('member','admin')
  → controllers/orders.controller.ts → getOrder()
  → PostgreSQL : orders.findUnique + orders_lines + session + activity.title
  → { data: Order & { lines: OrderLine[] } }
  → setOrder(d.data)

ORDERS — payer (Pending → Confirmed)
──────────────────────────────────────────────────────────────────────────────
OrderDetailPage.tsx  bouton "Payer la commande"
  → apiFetch('/api/orders/:id', { method: 'PUT', body: { status: 'Confirmed' } })
  → PUT /api/orders/:id  (auth)
  → [MW] requireAuth + requireRole('member','admin')
  → controllers/orders.controller.ts → updateOrder()
  → vérif transition : Pending → Confirmed ✅ (VALID_TRANSITIONS)
  → PostgreSQL : orders.update({ status: 'Confirmed' })
  → setOrder(o => { ...o, status: 'Confirmed' })
  [note : pas de Stripe — simulation uniquement, TODO dans le code]

ORDERS — annuler (Pending → Cancelled)
──────────────────────────────────────────────────────────────────────────────
OrderDetailPage.tsx  bouton "Annuler la commande" (double confirmation)
  → apiFetch('/api/orders/:id', { method: 'PUT', body: { status: 'Cancelled' } })
  → PUT /api/orders/:id  (auth)
  → [MW] requireAuth + requireRole('member','admin')
  → controllers/orders.controller.ts → updateOrder()
  → vérif transition : Pending → Cancelled ✅
  → PostgreSQL : orders.update({ status: 'Cancelled' })
  → navigate('/dashboard')

PANIER — flux manquant
──────────────────────────────────────────────────────────────────────────────
~~BasketPage.tsx  (vide — non implémentée)
  ~~ store/basketStore.ts → items, totalPrice()  [présent, persist localStorage]
  ~~ apiFetch('/api/orders', { method: 'POST', body: { user_id, lines: [...] } })
  ~~ POST /api/orders  (auth)
  ~~ controllers/orders.controller.ts → createOrder()
  ~~ PostgreSQL : $transaction → orders.create + orders_lines.create (vérif capacity)
  [ce flux est câblé backend mais n'a pas d'interface frontend]
```

---

### Zone 3 — Backoffice admin (`/manage`)

```
TOUTES RESSOURCES — flux admin (backend uniquement)
──────────────────────────────────────────────────────────────────────────────
~~ManagePage  (inexistante)
  ~~ apiFetch('/api/activities', { method: 'POST', body: {...} })
  ~~ POST /api/activities  (admin)
  ~~ [MW] requireAuth + requireRole('admin')
  ~~ controllers/activities.controller.ts → createActivity()

  ~~ apiFetch('/api/activities/:id', { method: 'PUT', body: {...} })
  ~~ PUT /api/activities/:id  (admin)
  ~~ controllers/activities.controller.ts → updateActivity()
  ~~ [note : rebuild slug, replace activities_categories via deleteMany + create]

  ~~ apiFetch('/api/activities/:id', { method: 'DELETE' })
  ~~ DELETE /api/activities/:id  (admin)
  ~~ controllers/activities.controller.ts → deleteActivity()
  ~~ [protection : refuse si orders_lines ou sessions liées]

  ~~ apiFetch('/api/sessions', { method: 'POST', body: {...} })
  ~~ POST /api/sessions  (admin)
  ~~ controllers/sessions.controller.ts → createSession()

  ~~ apiFetch('/api/sessions/:id', { method: 'PUT' / 'DELETE' })
  ~~ controllers/sessions.controller.ts → updateSession() / deleteSession()
  ~~ [DELETE refuse si orders_lines liées]

  ~~ apiFetch('/api/categories', { method: 'POST' / 'PUT' / 'DELETE' })
  ~~ controllers/categories.controller.ts → createCategory() / updateCategory() / deleteCategory()
  ~~ [DELETE refuse si activités orphelines]

  ~~ apiFetch('/api/orders')
  ~~ GET /api/orders  (admin uniquement — liste complète tous users)
  ~~ controllers/orders.controller.ts → getOrders()

  ~~ apiFetch('/api/users')
  ~~ GET /api/users  (admin)
  ~~ controllers/users.controller.ts → getUsers()

  ~~ apiFetch('/api/orders_lines')
  ~~ GET /api/orders_lines  (admin)
  ~~ controllers/orders.lines.controller.ts → getOrdersLines()
```

---

## PARTIE B — Flux narratif par type de données

---

### 1. Activities

**Lecture publique (liste paginée)**
`ActivitiesPage` et `HomePage` utilisent `hooks/useFetch.ts` qui émet un `fetch` natif sans `credentials`. L'URL `/api/activities` atterrit dans `routers/activities.router.ts` sans passer par aucun middleware. `activities.controller.ts → getActivities()` valide les query params via Zod (`page`, `limit`), puis interroge Prisma avec un `include` large : `activities_categories → category`, `sessions → orders_lines → order → user`. La réponse est reshapée pour exposer `categories[]` et `sessions[]` avec les users bookés.

**Lecture publique (détail par slug)**
`ActivityDetailPage` et `DynamicDetailPage` utilisent `fetch` natif direct (pas `useFetch`). `getActivityBySlug()` fait un `findFirst({ where: { slug } })` avec le même `include`. En parallèle, `ActivityDetailPage` émet un second fetch vers `/api/sessions?activity_slug=X&status=Scheduled` pour lister les sessions disponibles de cette activité.

**Écriture admin (create / update / delete)**
Aucune page frontend ne couvre ces flux. Backend : `requireAuth` lit le cookie `accessToken` via `cookie-parser`, `requireRole('admin')` fait un `findUnique` sur la table `roles`. `createActivity()` génère un slug via `utils/slugify.ts` et crée les liaisons `activities_categories` en cascade. `updateActivity()` fait un `deleteMany` sur la table pivot puis recrée les liaisons. `deleteActivity()` refuse la suppression si des `orders_lines` ou `sessions` sont liées.

---

### 2. Sessions

**Lecture publique (liste avec filtres)**
`SessionsPage` passe `status`, `sort`, `order` en query params. `getSessions()` valide via Zod un schéma strict (`SessionStatus` enum, `sort` enum `date|id`). Le calcul de `available_capacity` se fait en mémoire : `capacity - SUM(orders_lines.tickets_qty)` où les commandes `Cancelled` et `Refunded` sont exclues.

**Lecture publique (détail)**
`SessionDetailPage` appelle `GET /api/sessions/:id`. `getSession()` retourne le même calcul de capacité disponible, plus les données de l'activité associée (select minimal : id, title, slug, image_filename).

**Écriture admin**
Non implémentée frontend. `createSession()` valide que la date est dans le futur. `deleteSession()` refuse si des `orders_lines` sont liées à la session.

---

### 3. Categories

**Lecture publique**
`CategoriesPage` → `getCategories()` : retourne `activities_categories → activity` (id, title, slug uniquement) + `activities_count`. `CategoryDetailPage` charge la catégorie par slug, puis en parallèle les activités via `/api/activities?category_slug=X`. `DynamicDetailPage` tente d'abord un fetch activité par slug, et si 404 tente un fetch catégorie par slug — route fourre-tout pour `/:slug`.

**Écriture admin**
Non implémentée frontend. `deleteCategory()` contient une protection spécifique : elle refuse si des activités liées n'ont qu'une seule catégorie (elles deviendraient orphelines).

---

### 4. Orders

**Création (membre)**
Le flux de création est câblé backend (`createOrder()` dans une transaction Prisma sérialisée : création commande vide → loop sur les lignes avec vérif capacity atomique → calcul total TTC → `orders.update`), mais aucune page frontend ne l'invoque. `BasketPage` est vide, `basketStore` existe mais n'appelle jamais l'API.

**Lecture (membre — mes commandes)**
`DashboardPage` déclenche `apiFetch('/api/orders/mine')` uniquement quand `user !== null`. `apiFetch` gère le refresh automatique sur 401 via un flag module-level `isRefreshing` (évite les boucles infinies si plusieurs 401 simultanés). `getMyOrders()` filtre par `user_id: req.user.id` (injecté par `requireAuth`), retourne les lignes avec session + activity title.

**Lecture (membre — détail)**
`OrderDetailPage` appelle `apiFetch('/api/orders/:id')` au montage. `getOrder()` ne filtre pas par `user_id` — n'importe quel membre authentifié peut lire n'importe quelle commande par id. L'isolation est uniquement par rôle (`member` ou `admin`), pas par propriété.

**Mutation de statut (membre)**
`OrderDetailPage` émet `PUT /api/orders/:id` avec `{ status: 'Confirmed' }` (paiement simulé) ou `{ status: 'Cancelled' }` (annulation). `updateOrder()` applique une table de transitions autorisées (`VALID_TRANSITIONS`) : `Pending → Confirmed`, `Pending → Cancelled`, `Confirmed → Refunded`. Les autres transitions retournent 400.

**Lecture admin (liste complète)**
`GET /api/orders` est réservé `admin` et retourne toutes les commandes sans filtre user. Non consommé par le frontend.

---

### 5. Auth

**Démarrage de l'application**
`App.tsx` appelle `refreshToken()` dans un `useEffect` au montage, systématiquement, sans condition sur `user`. `refreshAccessToken()` lit le cookie httpOnly `refreshToken`, en extrait `tokenId` (UUID), fait un `findUnique` sur `RefreshToken.token_id`, vérifie le hash argon2, puis fait un `deleteMany` atomique (protection race condition : si `count === 0` → token déjà consommé). Un nouveau pair `accessToken` / `refreshToken` est émis. Un housekeeping silencieux nettoie les tokens expirés de l'utilisateur.

**Login**
`loginUser()` valide email + password via Zod, compare via argon2 (`lib/auth.ts → comparePassword`), génère access + refresh tokens (`lib/tokens.ts`), persiste le refresh en BDD (`persistRefreshToken` : hash argon2 du tokenId), pose les deux cookies httpOnly. Le frontend enchaîne immédiatement avec `GET /api/auth/profile` pour hydrater `store.user`.

**Register**
Identique au login côté cookies. Différence : le `user` est extrait du body de réponse (`data.data`) sans re-fetch profile. Le `role_id: 1` est hardcodé côté frontend dans le body du register.

**Logout**
`logoutUser()` supprime tous les `RefreshToken` de l'utilisateur en BDD, puis `clearCookie` dans `finally` (garanti même si la BDD throw). Le frontend set `user: null`.

**Guard des pages protégées**
`OrderDetailPage` a un `useEffect` qui redirige vers `/dashboard` si `!user && !isHydrating`. `DashboardPage` n'a pas ce guard réseau — elle affiche directement le formulaire si `user` est null sans vérifier la session côté serveur.

**Intercepteur 401 (`apiFetch`)**
Toutes les requêtes authentifiées passent par `apiFetch` (défini dans `authStore.ts`). Sur 401, si `isRefreshing` est false : déclenche `POST /api/auth/refresh`, si OK retry la requête originale, si KO appelle `logout()` et redirige vers `/dashboard`.

---

### 6. Panier (`basketStore`)

`basketStore` (Zustand + persist `localStorage`) gère les items localement : `addItem`, `removeItem`, `updateQuantity`, `clearBasket`, `totalItems()`, `totalPrice()`. Il n'émet aucun appel API. `BasketPage` est vide. Le pont entre le panier local et `POST /api/orders` n'est pas implémenté.

---

*Fin du document — généré depuis le code source de la branche `customer-account-dev`.*
