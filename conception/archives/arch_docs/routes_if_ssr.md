# Routes 🛣️

---

## 🚘 Routes publiques

| Route             | Description                        |
|-------------------|------------------------------------|
| /                 | Home                               |
| /zombieland       | Page À propos                      |
| /contact          | Page Contact                       |
| /categories       | Liste des catégories               |
| /categories/slug/ | Détail d’une catégorie             |
| /activities       | Liste des activités                |
| /activities/slug/ | Détail d’une activité              |
| /terms            | Page Conditions générales de vente |
| /privacy          | Page confidentialité               |
| /accessibility    | Page conformité accessibilité      |

---

## 🚧 Routes d'authentification & vues compte utilisateur

| Route     | Description                                     |
|-----------|-------------------------------------------------|
| /register | Créer un compte                                 |
| /login    | Connection au compte                            |
| /logout   | Déconnection du compte                          |
| /profile  | Accéder au profil membre, modifier ou supprimer |

---

### 🛒 Routes commandes & panier utilisateur

| Route          | Description                                             |
|----------------|---------------------------------------------------------|
| /order         | Commande en cours (pending), modification/annulation    |
| /checkout      | Paiement de la commande                                 |
| /orders        | Liste des commandes                                     |
| /orders/:id/   | Détail d'une commande                                   |

---

## 👮🏻‍♀️ Routes Administrateur

### Routes d'édition activités, sessions, catégories, pages

| Route                  | Description          |
|------------------------|----------------------|
| /admin/categories/     | Liste des catégories |
| /admin/categories/:id/ | Édition de catégorie |
| /admin/category/       | Créer une catégorie  |
| /admin/activities/     | Liste des activités  |
| /admin/activities/:id/ | Édition d'activité   |
| /admin/activity/       | Créer une activité   |
| /admin/pages/          | Liste des pages      |
| /admin/pages/:id/      | Édition de page      |
| /admin/sessions/       | Liste des sessions   |
| /admin/sessions/:id/   | Édition de sessions  |

---

### Routes d'édition de commandes

| Route              | Description                                       |
|--------------------|---------------------------------------------------|
| /admin/orders/     | Liste des commandes                               |
| /admin/orders/:id/ | Consultation, édition, suppression d'une commande |

---

## Routes d'édition d'utilisateur

| Route             | Description                                                |
|-------------------|------------------------------------------------------------|
| /admin/users      | Liste des comptes utilisateur                              |
| /admin/users/:id/ | Consultation, édition, suppression d'un compte utilisateur |
