# Endpoints

## 🗺️ Arborescence de l'application (routes Front-End) - MVP

```text
/                        → Page d'accueil
/activities              → Liste des activités
/activities/:id          → Détail d'une activité

/categories              → Liste des catégories
/categories/:id          → Détail d'une catégorie avec liste des activités

/register                → Inscription
/login                   → Connexion
/profile                 → Affichage du compte utilisateur
/profile:id              → Mise à jour du compte utilisateur
/profile/delete/:id      → Suppression du compte utilisateur

/reservations            → Liste des réservations utilisateur
/reservations:id         → Détail d'une réservation
/reservation             → Réservation de billets
/reservation:id          → Annulation d'une réservation

/admin                             → Tableau de bord admin

/admin/activities/                 → Liste des activités
/admin/activities/:id              → Détail d'une activité 
/admin/activities/add              → Ajout d'une activité
/admin/activities/update/:id       → Mise à jour d'une activité
/admin/activities/delete/:id       → Suppression d'une activité

/admin/categories/                 → Liste des catégories
/admin/categories/:id              → Détail d'une catégorie 
/admin/categories/add              → Ajout d'une catégorie
/admin/categories/update/:id       → Mise à jour d'une catégorie
/admin/categories/delete/:id       → Suppression d'une catégorie

/admin/reservations                → Liste des réservations
/admin/reservations/:id            → Détail d'une réservation
/admin/reservations/delete/:id     → Suppression d'une réservation

/admin/users                       → Liste des utilisateurs
/admin/users/:id                   → Détail d'un utilisateur
/admin/users/update/:id            → Mise à jour d'un utilisateur
/admin/users/delete/:id            → Suppression d'un utilisateur
````

---

## 📡 API - Endpoints du MVP - Back-End

| Méthode       | Endpoint                       | Description                             |
| ------------- | ------------------------------ | --------------------------------------- |
| GET           | /api/activites                 | Récupère toutes les activités           |
| GET           | /api/activites/:id             | Récupère les détails d’une activité     |
| GET           | /api/categories/:id            | Récupère toutes les catégories          |
| GET           | /api/categories/:id            | Récupère les détails d’une catégorie    |
| POST          | /api/auth/register             | Inscription                             |
| POST          | /api/auth/login                | Connexion                               |
| GET           | /api/profile                   | Récupère les infos utilisateur          |
| PUT           | /api/profile/:id               | Modifie les infos utilisateur           |
| DELETE        | /api/profile/delete/:id        | Supprime le compte utilisateur          |
| GET           | /api/reservations              | Récupère les réservations utilisateur   |
| GET           | /api/reservations/:            | Récupère les données d'une réservations |
| POST          | /api/reservation               | Créer une réservation                   |
| DELETE        | /api/reservation/:id           | Supprimer une réservation               |


### 📡 API - Endpoints d'administration

| Méthode       | Endpoint                        | Description                             |
| ------------- | ------------------------------- | --------------------------------------- |
| GET           | /api/admin/                     | Récupère l'accueil/tableau de bord admin|
| GET           | /api/activites                  | Récupère toutes les activités           |
| GET           | /api/activites/:id              | Récupère les détails d’une activité     |
| POST          | /api/activites/add              | Ajout d'une activité                    |
| PUT           | /api/activites/update/:id       | Mise à jour d'une activité              |
| DELETE        | /api/activites/delete/:id       | Suppression d'une activité              |
| GET           | /api/categories                 | Récupère toutes les catégories          |
| GET           | /api/categories/:id             | Récupère les détails d’une catégorie    |
| POST          | /api/categories/add             | Ajout d'une catégorie                   |
| PUT           | /api/categories/update/:id      | Mise à jour d'une catégorie             |
| DELETE        | /api/categories/delete/:id      | Suppression d'une catégorie             |
| GET           | /api/reservations               | Récupère toutes les réservations        |
| GET           | /api/reservations/:id           | Récupère les détails d’une réservation  |
| DELETE        | /api/reservations/delete/:id    | Suppression d'une réservation           |
| GET           | /api/users                      | Récupère toutes les utilisateurs        |
| GET           | /api/users/:id                  | Récupère les détails d’un utilisateur   |
| PUT           | /api/users/update/:id           | Mise à jour d'un utilisateur            |
| DELETE        | /api/users/delete/:id           | Suppression d'un utilisateur            |

---