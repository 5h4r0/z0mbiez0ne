# Fix anomalies — zombiezone `customer-account-dev`

## Contexte

Cinq anomalies ont été identifiées lors d'une cartographie complète des flux de données
(session 2026-05-22). Elles concernent la sécurité, l'intégrité du flux auth, et la
solidité du code. À corriger dans l'ordre ci-dessous.

Avant de commencer : lire les fichiers concernés avec `rtk read` avant de modifier.

---

## Anomalie 1 — Sécurité : `GET /api/orders/:id` ne filtre pas par `user_id`

**Fichier** : `backend/src/controllers/orders.controller.ts` → `getOrder()`

**Problème** : n'importe quel membre authentifié peut lire la commande d'un autre
utilisateur s'il connaît l'id. `getMyOrders()` filtre correctement par `user_id`,
`getOrder()` non.

**Fix** : dans `getOrder()`, ajouter `user_id` dans le `where` — sauf si le rôle est
`admin`, qui doit voir toutes les commandes.

```typescript
// Récupérer le roleName depuis req.user (chargé par requireRole ou à résoudre ici)
const isAdmin = req.user.roleName === 'admin';

const order = await prisma.orders.findUnique({
  where: {
    id: Number(id),
    // membres : restreindre à leurs propres commandes
    // admins : pas de filtre user_id
    ...(!isAdmin && { user_id: req.user.id }),
  },
  include: { ... },
});
```

Note : `req.user.roleName` est disponible si `requireRole` a été appelé avant.
Si absent (le router appelle `requireRole('member', 'admin')` donc il est chargé),
faire un fallback `prisma.roles.findUnique`.

---

## Anomalie 2 — Guard réseau absent sur `DashboardPage`

**Fichier** : `vite-frontend/src/pages/dashboard/DashboardPage.tsx`

**Problème** : `DashboardPage` affiche le formulaire login/register si `user === null`
sans vérifier la session côté serveur au montage. Si un utilisateur accède à la page
via le bouton "précédent" du navigateur (bfcache), la page est restaurée depuis la
mémoire sans re-exécuter le JS — le `user` Zustand peut sembler null alors que la
session est valide (ou inversement).

`OrderDetailPage` gère ça correctement avec :
```typescript
useEffect(() => {
  if (isHydrating) return;
  if (!user) navigate('/dashboard', { replace: true });
}, [isHydrating, user, navigate]);
```

**Fix** : `DashboardPage` affiche déjà `isHydrating` comme état de chargement, c'est
bien. Mais ajouter un `useEffect` qui, une fois `isHydrating === false` et `user !== null`,
vérifie la session via `apiFetch('/api/auth/profile')` et met à jour ou invalide le store
si la réponse est 401. Cela protège le cas bfcache où le user Zustand est périmé.

```typescript
useEffect(() => {
  if (isHydrating || !user) return;
  // Vérifie que la session est toujours valide côté serveur
  apiFetch('/api/auth/profile')
    .then((r) => { if (!r.ok) useAuthStore.getState().logout(); })
    .catch(() => {});
}, [isHydrating, user]);
```

---

## Anomalie 3 — Asymétrie `register` vs `login` dans `authStore`

**Fichier** : `vite-frontend/src/store/authStore.ts`

**Problème** : `login()` enchaîne `POST /api/auth/login` puis `GET /api/auth/profile`
pour hydrater `store.user`. `register()` hydrate `store.user` directement depuis
`data.data` dans le body de réponse — sans re-fetch `/profile`.

Conséquences :
- Le shape de `user` peut diverger entre login et register si le backend évolue
- `register()` expose potentiellement plus de champs que ce que `/profile` retourne
- Comportement incohérent difficile à maintenir

**Fix** : aligner `register()` sur le pattern de `login()` — après le register,
enchaîner un `GET /api/auth/profile` :

```typescript
register: async ({ firstname, lastname, email, password, confirm }) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, email, password, confirm, role_id: 1 }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Inscription échouée');

  // Aligner sur login() : toujours hydrater depuis /profile
  const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
  if (!profileRes.ok) throw new Error('Impossible de récupérer le profil');
  const user = (await profileRes.json()) as AuthUser;
  set({ user });
},
```

---

## Anomalie 4 — `basketStore` déconnecté de l'API

**Fichiers** : `vite-frontend/src/store/basketStore.ts`, `vite-frontend/src/pages/BasketPage.tsx`

**Problème** : `basketStore` gère correctement les items localement (add, remove,
updateQuantity, totaux). Mais `BasketPage` est vide et commentée dans le routing.
Le pont `POST /api/orders` n'existe pas — un utilisateur ne peut pas passer commande.

**Fix** : implémenter `BasketPage` avec :

1. Affichage des items du `basketStore`
2. Bouton "Passer commande" qui appelle :
```typescript
apiFetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: user.id,
    lines: items.map((i) => ({
      session_id: i.sessionId,
      tickets_qty: i.quantity,
    })),
  }),
})
```
3. Si `!user` → rediriger vers `/dashboard?redirectTo=/panier`
4. Si succès → `basketStore.clearBasket()` + `navigate('/dashboard/commandes/:id')`
5. Gérer les erreurs métier : `insufficientCapacity` (session complète), `sessionNotFound`

Note : la route `/panier` est déjà dans `App.tsx` mais commentée dans le routing
— la décommenter après l'implémentation.

---

## Anomalie 5 — `role_id: 1` hardcodé dans `register`

**Fichier** : `vite-frontend/src/store/authStore.ts`

**Problème** : `role_id: 1` est écrit en dur dans le body du register.
C'est fonctionnellement correct (`1 = member` est stable par convention),
mais c'est un magic number sans contexte.

**Convention à respecter (ne pas modifier les ids) :**
- `role_id: 1` = `member` — utilisateur standard
- `role_id: 2` = `admin` — accès `/manage` uniquement, jamais auto-assignable

**Fix** : extraire une constante dans un fichier partagé :

```typescript
// vite-frontend/src/lib/roles.ts
export const ROLE_IDS = {
  member: 1,
  admin: 2,
} as const;
```

Puis dans `authStore.ts` :
```typescript
import { ROLE_IDS } from '../lib/roles.js';
// ...
body: JSON.stringify({ ..., role_id: ROLE_IDS.member }),
```

Cela documente l'intention, élimine le magic number, et empêche une assignation
accidentelle du role admin depuis le frontend.

---

## Ordre d'exécution recommandé

```
1. Anomalie 1  (sécurité — priorité haute)
2. Anomalie 3  (avant les tests auth — aligne register sur login)
3. Anomalie 5  (rapide — extraction constante)
4. Anomalie 2  (guard réseau DashboardPage)
5. Anomalie 4  (BasketPage — scope plus large, faire en dernier)
```

Après anomalie 1 : `rtk git diff` pour vérifier que le filtre `user_id` est correct
avant de commit.

Commit suggéré :
```
fix: 🐛 corrections sécurité et cohérence auth/orders/basket

- orders: GET /api/orders/:id filtré par user_id pour les membres
- authStore: register() aligne sur login() via re-fetch /profile
- authStore: role_id extrait en constante ROLE_IDS
- DashboardPage: guard réseau au montage (protection bfcache)
- BasketPage: implémentation flux commande + appel POST /api/orders
```
