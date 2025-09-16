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

| Route               | Description                                             |
|---------------------|---------------------------------------------------------|
| /register           | Créer un compte                                         |
| /login              | Connection au compte                                    |
| /orders             | Commande en pending, annulation de commande             |
| /checkout           | Paiement de la commande                                 |
| /user               | Page profil                                             |
| /user/orders        | Liste des commandes                                     |
| /user/orders/:id/   | Détail de commande                                      |
| /user/ordershistory | Historique commandes, annulation d'une commande pending |

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
| /admin/orders/:id/ | Comsultation, édition, suppression d'une commande |

---

## Routes d'édition d'utilisateur

| Route             | Description                                                |
|-------------------|------------------------------------------------------------|
| /admin/users      | Liste des comptes utilisateur                              |
| /admin/users/:id/ | Comsultation, édition, suppression d'un compte utilisateur |
