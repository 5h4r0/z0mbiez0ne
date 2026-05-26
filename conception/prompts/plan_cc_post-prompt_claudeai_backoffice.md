# Plan CC — Scaffold `/manage` (backoffice admin)

> Prompt initial → plan validé → application → résultat

---

## Contexte

L'espace client `/dashboard` existe mais mélange login et dashboard dans un seul composant. L'espace admin `/manage` n'existe pas encore — routes backend prêtes, frontend à créer de zéro. Le but est de scaffolder tout l'espace admin avec guard réseau, layout, pages stubs et routing.

---

## Phase 0 — Refactoring DashboardPage

Séparer `vite-frontend/src/pages/dashboard/DashboardPage.tsx` (280 lignes, login + orders) en :

- **`DashboardLoginPage.tsx`** : formulaire login + register (tabs existants), route `/dashboard/login`. Redirige vers `/dashboard` si déjà connecté.
- **`DashboardPage.tsx`** (rewrite) : dashboard commandes uniquement, protégé. Si non connecté → redirect `/dashboard/login`.

Logique de guard : `isHydrating` → spinner ; pas de user → redirect `/dashboard/login`.

---

## Phase 1 — Types

**`vite-frontend/src/types/manage.ts`**

```ts
// Étendre les types api.ts existants
export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
export type SessionStatus = 'Scheduled' | 'Cancelled' | 'Completed';

export interface ManageUser { id, firstname, lastname, email, created_at, deleted_at, role: { id, name } }
export interface ManageOrder { id, user_id, status: OrderStatus, total_amount, payment_method, payment_date, created_at, deleted_at }
export interface ManageOrderLine { id, order_id, session_id, tickets_qty, amount }

// Schémas Zod pour forms + parse réponses API
export const activitySchema = z.object({ title, description, activities_categories })
export const categorySchema = z.object({ title, description, image_filename })
export const sessionSchema = z.object({ activity_id, date, capacity, unit_price, status })
export const orderStatusSchema = z.object({ status: z.enum([...]) })
```

---

## Phase 2 — AdminGuard

**`vite-frontend/src/components/manage/AdminGuard.tsx`**

- `useEffect` au montage : `apiFetch('/api/auth/profile')` → vérifie `role_id === ROLE_IDS.admin`
- Protège contre bfcache (call réseau, pas juste state Zustand)
- `isHydrating` ou vérification en cours → `<div className="manage-loading">Chargement…</div>`
- Non admin → `<Navigate to="/manage/login" replace />`
- Admin → `<Outlet />`

---

## Phase 3 — ManageLayout

**`vite-frontend/src/components/manage/ManageLayout.tsx`**

- Pas de `<Header>` / `<Footer>` public (wrappé en dehors dans App.tsx)
- Structure : sidebar fixe (gauche) + zone contenu (`<Outlet />`)
- Liens sidebar : Hub `/manage`, Activités `/manage/activities`, Catégories `/manage/categories`, Sessions `/manage/sessions`, Commandes `/manage/orders`, Utilisateurs `/manage/users`
- Lien actif : `NavLink` avec classe CSS active
- Bouton Déconnexion : appelle `useAuthStore.getState().logout()` puis redirect `/manage/login`
- CSS variables uniquement : `--color-bg`, `--color-surface`, `--color-border`, `--color-red`, `--color-text`

---

## Phase 4 — Composants réutilisables

### ConfirmModal

**`vite-frontend/src/components/manage/ConfirmModal.tsx`**

- Props : `{ isOpen, title, message, onCancel, onConfirm, danger?: boolean }`
- État interne `confirmed: boolean`
- État 1 : bouton "Valider" neutre
- État 2 (après 1er clic) : bouton "Confirmer" rouge si `danger`, message d'avertissement visible
- `onCancel` reset l'état + ferme
- Accessibilité : `role="dialog"`, `aria-modal`, focus trap, `Escape` pour fermer

### ManageTable

**`vite-frontend/src/components/manage/ManageTable.tsx`**

```ts
interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
}
interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}
```

- Colonne actions (Edit/Delete) ajoutée automatiquement si callbacks fournis
- Zéro dépendance externe
- Styles CSS variables

---

## Phase 5 — Pages stubs

### ManageLoginPage

**`vite-frontend/src/pages/manage/ManageLoginPage.tsx`**

- Form login uniquement (pas de register)
- Zod client : `z.object({ email: z.string().email(), password: z.string().min(1) })`
- `login()` du store → fetch profile → si `role_id !== ROLE_IDS.admin` : message "Accès refusé", logout
- Succès → navigate `/manage`

### ManageHubPage

**`vite-frontend/src/pages/manage/ManageHubPage.tsx`**

- Cards de navigation vers chaque section
- Fetch stats (optionnel) : count activités, sessions Scheduled, commandes Pending via `Promise.all`

### Pages liste

Chaque page : `ManageActivitiesPage`, `ManageCategoriesPage`, `ManageSessionsPage`, `ManageOrdersPage`, `ManageUsersPage`

Pattern commun :

```ts
// 1. fetch au montage via apiFetch
// 2. parse réponse avec Zod (schéma liste)
// 3. <ManageTable> avec colonnes pertinentes
// 4. Bouton "Nouveau" (sauf Orders et Users)
// 5. <ConfirmModal> sur delete
```

Colonnes par page :

| Page | Colonnes |
|---|---|
| Activities | Titre, Slug, Actions (edit/delete) |
| Categories | Titre, Slug, Actions (edit/delete) |
| Sessions | Date, Activité, Capacité, Dispo, Prix, Statut, Actions (edit/delete) |
| Orders | ID, Statut, Total, Méthode paiement, Date _(pas de delete)_ |
| Users | Prénom, Nom, Email, Rôle, Créé le, Supprimé le |

---

## Phase 6 — Routing (App.tsx)

**`vite-frontend/src/components/App.tsx`**

```tsx
<Route path="/dashboard/login" element={<DashboardLoginPage />} />
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/manage/login" element={<ManageLoginPage />} />
<Route path="/manage" element={<AdminGuard />}>
  <Route element={<ManageLayout />}>
    <Route index element={<ManageHubPage />} />
    <Route path="activities" element={<ManageActivitiesPage />} />
    <Route path="categories" element={<ManageCategoriesPage />} />
    <Route path="sessions" element={<ManageSessionsPage />} />
    <Route path="orders" element={<ManageOrdersPage />} />
    <Route path="users" element={<ManageUsersPage />} />
  </Route>
</Route>
```

> Les routes `/manage/*` sont placées AVANT `/:slug` pour éviter le catch-all.

---

## Fichiers à modifier

| Fichier | Action |
|---|---|
| `vite-frontend/src/components/App.tsx` | Ajouter imports + routes manage, split dashboard |
| `vite-frontend/src/pages/dashboard/DashboardPage.tsx` | Rewrite (orders seul) |

## Fichiers à créer

```
vite-frontend/src/pages/dashboard/DashboardLoginPage.tsx
vite-frontend/src/types/manage.ts
vite-frontend/src/components/manage/AdminGuard.tsx
vite-frontend/src/components/manage/ManageLayout.tsx
vite-frontend/src/components/manage/ConfirmModal.tsx
vite-frontend/src/components/manage/ManageTable.tsx
vite-frontend/src/pages/manage/ManageLoginPage.tsx
vite-frontend/src/pages/manage/ManageHubPage.tsx
vite-frontend/src/pages/manage/ManageActivitiesPage.tsx
vite-frontend/src/pages/manage/ManageCategoriesPage.tsx
vite-frontend/src/pages/manage/ManageSessionsPage.tsx
vite-frontend/src/pages/manage/ManageOrdersPage.tsx
vite-frontend/src/pages/manage/ManageUsersPage.tsx
```

---

## Vérification

```bash
# Lancer le projet
npm run dev

# TypeScript
rtk tsc
```

Tests manuels :

- `/dashboard/login` → formulaire login/register
- `/dashboard` (non connecté) → redirect `/dashboard/login`
- `/manage/login` → formulaire login admin
- `/manage/login` avec compte member → "Accès refusé"
- `/manage/login` avec compte admin → redirect `/manage` (hub)
- `/manage` (non connecté) → redirect `/manage/login`
- `/manage` (bfcache simulé — navigateur back button) → guard réseau recheck
- Chaque page `/manage/*` → liste se charge, ManageTable affiché
- ConfirmModal : 2 clics pour confirmer, Escape annule

---

## Retour post-application CC

**Résultat : zéro erreur TypeScript. Scaffold complet.**

### Phase 0 — Dashboard splitté

- `DashboardLoginPage.tsx` — login + register, redirige vers `/dashboard` si déjà connecté
- `DashboardPage.tsx` — orders seul, guard réseau + redirect `/dashboard/login`

### Phase 1–4 — Fondations manage

- `types/manage.ts` — interfaces + schémas Zod (forms et parse API)
- `AdminGuard.tsx` — call réseau `/api/auth/profile` au montage, protection bfcache
- `ManageLayout.tsx` — sidebar + `<Outlet />`, sans Header/Footer public
- `manage.css` — design system CSS variables complet
- `ConfirmModal.tsx` — staged confirm (2 clics), focus trap, Escape
- `ManageTable.tsx` — générique avec colonnes typées

### Phase 5 — 6 pages

- `ManageLoginPage.tsx` — login admin + vérif `role_id`
- `ManageHubPage.tsx` — cards navigation + stats légères
- Activities, Categories, Sessions, Orders, Users — fetch + Zod parse + ManageTable + ConfirmModal

### Phase 6 — Routing

- `App.tsx` — layout route `PublicLayout` (Header/Footer) pour le site public, routes `/manage/*` séparées sans Header/Footer
