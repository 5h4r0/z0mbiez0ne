# Prompt CC — Pages du site `sharo.fr`

## Contexte

Suite de la homepage déjà livrée. Le design system est en place :
- Variables CSS dans `App.css` (`--color-bg`, `--color-surface`, `--color-red`, `--color-gold`, etc.)
- Google Fonts `Montserrat` dans `index.html`
- Header et Footer déjà faits (`src/components/Header.tsx`, `src/components/Footer.tsx`)
- Types API dans `src/types/api.ts` (`Session`, `Activity`, `Category`)
- Cards réutilisables dans `src/components/home/`

Conventions du projet (non négociables) :
- **Pas de `any`** TypeScript
- Guard clauses, pas d'imbrication
- `??` plutôt que `||`
- `<Link>` React Router 7
- Tailwind pour le layout, SCSS pour les styles spécifiques
- Images dans `public/images/`, référencées en `/images/nom.ext`

---

## Fichiers à produire

```
src/pages/
  SessionsPage.tsx + .scss        → /sessions
  SessionDetailPage.tsx + .scss   → /:activitySlug-:sessionId
  ActivitiesPage.tsx + .scss      → /les-epreuves
  ActivityDetailPage.tsx + .scss  → /:activitySlug
  CategoriesPage.tsx + .scss      → /categories-epreuves
  CategoryDetailPage.tsx + .scss  → /:categorySlug
  PlanPage.tsx                    → /plan
  TarifsPage.tsx                  → /tarifs
  FaqPage.tsx                     → /faq
  MentionsLegalesPage.tsx         → /mentions-legales
  CguPage.tsx                     → /cgu
  ConfidentialitePage.tsx         → /confidentialite
  ContactPage.tsx + .scss         → /contact
  BasketPage.tsx + .scss          → /panier
  NotFoundPage.tsx                → *
```

Mettre à jour `src/components/App.tsx` avec toutes ces routes.

---

## Endpoints API

Base URL : `http://localhost:3000`

```
GET /sessions?limit=12&page=1&sort=date&order=asc&status=Scheduled
GET /sessions/:id
GET /activities?limit=12&page=1
GET /activities/:slug
GET /categories?limit=12&page=1
GET /categories/:slug
GET /activities?category_slug=:slug&limit=12&page=1   → activités d'une catégorie
```

Shape de pagination attendue en réponse :
```ts
{
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

Si le backend renvoie une shape différente, adapter sans casser le typage.

---

## Pages liste avec pagination

### `SessionsPage` — `/sessions`

- Titre de page `PROCHAINES SESSIONS`
- Filtre par statut (pills cliquables) : Toutes / Scheduled / Completed / Cancelled
- Grid 4 col → 2 → 1, cards `SessionCard` réutilisées depuis `components/home/`
- Pagination : boutons Précédent / Suivant + numéros de page, 12 items/page
- État vide : message "Aucune session disponible pour le moment"
- Skeleton pendant le chargement

### `ActivitiesPage` — `/les-epreuves`

- Titre `LES ÉPREUVES DE LA ZONE`
- Grid 4 col → 2 → 1, cards `ActivityCard` réutilisées
- Filtre textuel (input search) sur le titre côté client
- Pagination 12 items/page
- État vide + skeleton

### `CategoriesPage` — `/categories-epreuves`

- Titre `EXPLOREZ NOS CATÉGORIES`
- Grid 4 col → 2 → 1, cards `CategoryCard` réutilisées
- Pagination 12 items/page
- État vide + skeleton

---

## Pages détail

### `ActivityDetailPage` — `/:activitySlug`

Layout :
- **Hero** pleine largeur (60vh) : `image_filename` en background, overlay sombre, titre centré
- **Corps** (max-width 900px centré) :
  - Description complète
  - Métadonnées : durée fictive `20 min.`, icône Clock (lucide-react)
  - Section `SESSIONS DISPONIBLES` : liste des sessions liées à cette activité (`GET /sessions?activity_slug=:slug&status=Scheduled&limit=6`) sous forme de cards compactes horizontales (date | prix | places | bouton Réserver)
  - Si aucune session : "Aucune session planifiée pour cette épreuve."
- Bouton retour `← Toutes les épreuves` → `/les-epreuves`

### `SessionDetailPage` — `/:activitySlug-:sessionId`

> **Note routing** : le paramètre URL est `:activitySlug-:sessionId`. Extraire `sessionId` (dernier segment après le dernier `-`), utiliser `GET /sessions/:id` pour récupérer la session, puis `GET /activities/:slug` pour l'activité liée.

Layout :
- **Hero** : même style que ActivityDetailPage, image de l'activité liée
- **Corps** (max-width 900px centré) :
  - Titre : `[Activité] — Session du [date longue]`
  - Métadonnées : date, heure, places disponibles (`capacity`), prix unitaire
  - Description de l'activité liée
  - **Bloc réservation** : sélecteur quantité (1–10, défaut 1), total calculé en temps réel, bouton rouge `Ajouter au panier` (pas de logique panier requise — `console.log` suffit)
- Bouton retour `← Retour à [activité]` → `/:activitySlug`

### `CategoryDetailPage` — `/:categorySlug`

Layout :
- **Hero** (60vh) : image de la catégorie, overlay, titre
- **Corps** :
  - Description complète
  - Titre `LES ÉPREUVES DE CETTE CATÉGORIE`
  - Grid 4 → 2 → 1 des activités liées (`GET /activities?category_slug=:slug&limit=12`)
  - Cards `ActivityCard` réutilisées
  - État vide si aucune activité
- Bouton retour `← Toutes les catégories` → `/categories-epreuves`

---

## Pages statiques (contenu fictif cohérent avec l'univers)

Style commun : fond `--color-bg`, max-width 900px centré, padding généreux, titres et corps Montserrat. Pas de hero image.

### `PlanPage` — `/plan`

- Titre `PLAN DU PARC`
- SVG simplifié du parc : zones nommées (Entrée, Zone Survival, Zone Spectacle, Zone Escape, Zone Horreur, Sortie de Secours), style carte militaire/post-apo (lignes blanches sur fond sombre, labels en Montserrat uppercase)
- Légende sous le plan

### `TarifsPage` — `/tarifs`

- Titre `TARIFS & FORMULES`
- 3 colonnes de tarifs :
  - **Survivant Solo** — à partir de 25€ — 1 activité au choix
  - **Pack Horde** (le plus populaire, badge rouge) — 59€ — 3 activités + accès zones VIP
  - **Forfait Apocalypse** — 99€ — Accès illimité journée + 1 goodies
- Tableau comparatif en dessous : features vs formules (checkmarks)
- Note légale fictive en bas

### `FaqPage` — `/faq`

- Titre `FOIRE AUX QUESTIONS`
- 8–10 questions/réponses en accordéon (CSS pur ou state React) :
  - Exemples : "Peut-on venir en groupe ?", "Y a-t-il un âge minimum ?", "Les zombies mordent-ils vraiment ?", "Que faire si je meurs de peur ?", "Puis-je annuler ma réservation ?", etc.
  - Réponses fictives mais cohérentes avec l'univers

### `MentionsLegalesPage` — `/mentions-legales`

- Titre `MENTIONS LÉGALES`
- Éditeur fictif : `ZombieZone SAS, 30000 Nîmes, France`
- Hébergeur fictif : `Kadath Hosting, Zone Interdite 51`
- Sections standard (éditeur, hébergeur, propriété intellectuelle, données personnelles) en contenu fictif zombifié

### `CguPage` — `/cgu`

- Titre `CONDITIONS GÉNÉRALES D'UTILISATION`
- Articles numérotés (1–6), contenu fictif légal zombifié
- Inclure une clause : *"En entrant dans le parc, vous acceptez que ZombieZone décline toute responsabilité en cas de morsure de zombie, de syncope ou de perte totale de la raison."*

### `ConfidentialitePage` — `/confidentialite`

- Titre `POLITIQUE DE CONFIDENTIALITÉ`
- Sections : données collectées, finalités, durée de conservation, droits (accès, rectification, suppression), contact DPO fictif
- Contenu fictif mais structuré correctement

---

## `ContactPage` — `/contact`

- Titre `CONTACTEZ LA ZONE`
- Layout 2 colonnes :
  - **Gauche** : formulaire (Nom, Email, Sujet, Message, bouton `Envoyer dans le vide`), pas de logique d'envoi — `console.log` + message de confirmation UI après submit
  - **Droite** : infos de contact fictives (adresse, email, téléphone), horaires d'ouverture, carte SVG inline minimaliste (juste un rectangle avec marqueur de position)
- Style cohérent avec le reste

---

## `BasketPage` — `/panier`

- Titre `VOTRE PANIER`
- État vide par défaut : illustration SVG (panier vide post-apo), message *"Votre panier est vide. Les zombies, eux, n'attendent pas."*, bouton `Voir les sessions` → `/sessions`
- Prévoir le layout pour items (liste + total + bouton Commander) mais afficher l'état vide pour l'instant
- Pas de logique Zustand requise pour ce batch

---

## `NotFoundPage` — `*`

- Full page centrée, fond `--color-bg`
- Grand `404` en couleur `--color-red`, très grand
- Sous-titre : *"Cette page a été dévorée par les zombies."*
- Bouton `Retourner à l'accueil` → `/`
- Animation CSS : léger flicker sur le 404 (keyframe opacity)

---

## Routing — `App.tsx`

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/sessions" element={<SessionsPage />} />
  <Route path="/les-epreuves" element={<ActivitiesPage />} />
  <Route path="/categories-epreuves" element={<CategoriesPage />} />
  <Route path="/plan" element={<PlanPage />} />
  <Route path="/tarifs" element={<TarifsPage />} />
  <Route path="/faq" element={<FaqPage />} />
  <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
  <Route path="/cgu" element={<CguPage />} />
  <Route path="/confidentialite" element={<ConfidentialitePage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/panier" element={<BasketPage />} />
  {/* Détail — ordre important : spécifique avant générique */}
  <Route path="/:activitySlug-:sessionId" element={<SessionDetailPage />} />
  <Route path="/:categorySlug" element={<CategoryDetailPage />} />
  <Route path="/:activitySlug" element={<ActivityDetailPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

> ⚠️ Le pattern `/:activitySlug-:sessionId` peut ne pas être supporté nativement par React Router 7. Si c'est le cas, utiliser `/:sessionPath` et parser manuellement le `sessionId` (dernier segment après le dernier `-`) dans le composant.

---

## Checklist finale

- [ ] Zéro `any` TypeScript
- [ ] Toutes les routes dans `App.tsx`
- [ ] Skeleton sur toutes les pages avec fetch API
- [ ] Gestion d'erreur par section (les autres sections continuent)
- [ ] Responsive : 1400px → 768px → 375px
- [ ] État vide sur toutes les listes
- [ ] Pages statiques : contenu fictif cohérent avec l'univers zombie
- [ ] `BasketPage` : état vide uniquement, layout item prévu mais vide
- [ ] `NotFoundPage` : animation flicker sur le 404
