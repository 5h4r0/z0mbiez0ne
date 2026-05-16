# 📡 Endpoints API

---

## 🔑 Authentification & création Utilisateur

| Méthode | Endpoint              | Description                    |
|---------|-----------------------|--------------------------------|
| POST    | /api/auth/register    | Créer un compte utilisateur    |
| POST    | /api/auth/login       | Se connecter                   |
| POST    | /api/auth/refresh     | Rafraîchir le token JWT        |
| POST    | /api/auth/logout      | Se déconnecter                 |
| GET     | /api/auth/profile     | Obtenir son profil utilisateur |

---

## 📂 Categories

| Méthode | Endpoint            | Description         |
|---------|---------------------|---------------------|
| GET     | /api/categories     | Liste catégories    |
| GET     | /api/categories/:id | Détail catégorie    |
| POST    | /api/categories     | Créer catégorie     |
| PUT     | /api/categories/:id | Modifier catégorie  |
| DELETE  | /api/categories/:id | Supprimer catégorie |

---

## 📂 Activities

| Méthode | Endpoint            | Description        |
|---------|---------------------|--------------------|
| GET     | /api/activities     | Liste Activités    |
| GET     | /api/activities/:id | Détail Activité    |
| POST    | /api/activities     | Créer Activité     |
| PUT     | /api/activities/:id | Modifier Activité  |
| DELETE  | /api/activities/:id | Supprimer Activité |

---

## 📂 Sessions

| Méthode | Endpoint          | Description       |
|---------|-------------------|-------------------|
| GET     | /api/sessions     | Liste sessions    |
| GET     | /api/sessions/:id | Détail session    |
| POST    | /api/sessions     | Créer session     |
| PUT     | /api/sessions/:id | Modifier session  |
| DELETE  | /api/sessions/:id | Supprimer session |

---

### Orders Lines

| Méthode | Endpoint             | Description                          |
|---------|----------------------|--------------------------------------|
| GET     | /api/orders_lines     | Liste des réservations de session    |
| GET     | /api/orders_lines/:id | Détail d'une réservation de session  |
| POST    | /api/orders_lines     | Créer une réservation de session     |
| PUT     | /api/orders_lines/:id | Modifier une réservation de session  |
| DELETE  | /api/orders_lines/:id | Supprimer une réservation de session |

---

## 🧾 Orders

| Méthode | Endpoint        | Description                        |
|---------|-----------------|------------------------------------|
| GET     | /api/orders     | Liste des commandes                |
| GET     | /api/orders/:id | Détail d’une commande              |
| POST    | /api/orders     | Créer une commande                 |
| PUT     | /api/orders/:id | Modifier une commande              |
| DELETE  | /api/orders/:id | Supprimer une commande (non payée) |

---

## 👥 Users

| Méthode | Endpoint       | Description           |
|---------|----------------|-----------------------|
| GET     | /api/users     | Liste utilisateurs    |
| GET     | /api/users/:id | Détail utilisateur    |
| PUT     | /api/users/:id | Modifier utilisateur  |
| DELETE  | /api/users/:id | Supprimer compte      |
