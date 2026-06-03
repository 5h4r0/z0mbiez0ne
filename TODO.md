# TODO.md — zØmbie zØone
> État au 2026-06-03 — examen CDA le 2026-06-09

---

## ✅ Réalisé

### Backend
- [x] API REST complète — auth, activities, categories, sessions, orders, order_lines, users, roles
- [x] Auth JWT — access token (15min) + refresh token (7j), cookies httpOnly
- [x] Rotation refresh token + révocation à la déconnexion
- [x] Validation Zod sur tous les inputs
- [x] Soft delete — users, orders
- [x] Hard delete — activities, categories, sessions
- [x] Upload images activités (banner + thumb)
- [x] Swagger — sharo.fr/api/docs
- [x] `PUT /api/users/:id/password` — vérif current_password, révocation RefreshToken, ownership check
- [x] Ownership checks — updateUser, deleteUser
- [x] deleteUser bloqué si commande Pending ou Confirmed

### Tests
- [x] Tests intégration — 129 tests (auth, activities, categories, sessions, orders, users)
- [x] Tests unitaires — 35 tests (tokens, auth lib, slugify, getPagination)
- [x] Infrastructure Vitest — globalSetup Docker, fileParallelism:false, BDD test isolée

### Frontend
- [x] Site vitrine — HomePage, ActivitiesPage, SessionsPage, CategoriesPage, pages détail
- [x] Espace client — DashboardPage, OrderDetailPage
- [x] Backoffice admin — CRUD activités, sessions, catégories, utilisateurs (read-only), commandes avec changement de statut
- [x] Auth — login, register, logout, refresh, guard bfcache
- [x] Panier — basketStore (Zustand)
- [x] `apiFetch` — intercepteur 401 + retry après refresh
- [x] `useFetch` — error string + status HTTP exposés
- [x] Menu burger — breakpoint 910px (Tailwind v4 custom breakpoint `nav:`)

### Infrastructure
- [x] Docker — dev + prod
- [x] Déploiement VPS Ionos — sharo.fr
- [x] CI/CD GitHub Actions — lint → test → build → deploy
- [x] SSL Let's Encrypt

---

## ✅ MVP — Complet

---

## 🟡 Anomalies — état final

| # | Description | Statut |
|---|-------------|--------|
| #2 | `useFetch` sans gestion 401 | ✅ Fermé — error string + status HTTP |
| #4 / BUG-4 | Images manquantes dans le seed | ✅ Fermé — `image_filename: null` + `onError` fallback |
| #5 | Zustand persist token supprimé | ✅ Fermé (audit 2026-05-26) |
| #6 | `basketStore` persist localStorage | 🟡 Accepté — validation backend protège |
| #7 | Stripe | 🟡 Hors MVP selon specs |
| BUG-9 | TipTap console warning | ✅ Fermé — `onChangeRef` + `setContent` corrigé |
| BUG-10 | Commandes en read-only dans le backoffice | ✅ Fermé — select statut inline avec transitions |
| BUG-12 | Modale double confirmation | ✅ Comportement voulu — protection délibérée |
| BUG-13 | Hero portrait mobile | ✅ Vérifié OK — pas de débordement |

---

## 📋 Dossiers CDA — priorité absolue avant le 2026-06-09

- [ ] **Dossier projet** — à partir du référentiel RNCP CDA niveau 6
- [ ] **Dossier professionnel**
- [ ] **Présentation orale** — support slides

---

## 📧 Emails (post-examen)

- [ ] Validation création compte — Nodemailer ou Resend
- [ ] Oubli mot de passe + page publique (ou /dashboard/settings directement par lien de connexion ?)
- [ ] Confirmation commande — lignes HT + total TTC

---

## Détails en /manage/sessions/:id et /manage/commandes/:id (post-examen)

### Sessions
- Page détail : date, activité, statut, capacité/dispo
- Tableau des inscrits : orders_lines liées à la session → order.user → nom/prénom + qty + statut commande
- Backend : enrichir GET /api/sessions/:id avec orders_lines + users

### Orders
- Page détail : date, statut, total
- Tableau des lignes : orders_lines → session (date, activité) + qty + montant
- Backend : GET /api/orders/:id existe déjà — vérifier si orders_lines sont incluses
