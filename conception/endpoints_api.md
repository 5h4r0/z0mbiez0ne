# 📡 Endpoints API

---

## 🔑 Authentification & création Utilisateur

| Méthode | Endpoint         | Description                    |
|---------|------------------|--------------------------------|
| POST    | /api/register    | Créer un compte utilisateur    |
| POST    | /api/login       | Se connecter                   |
| POST    | /api/refresh     | Rafrîchir le token JWT         |
| POST    | /api/logout      | Se déconnecter                 |
| GET     | /api/profile     | Obtenir son profil utilisateur |
| PUT     | /api/profile/:id | Mettre à jour son profil       |
| DELETE  | /api/profile/:id | Supprimer son compte           |

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

### OrderLines

| Méthode | Endpoint             | Description                          |
|---------|----------------------|--------------------------------------|
| GET     | /api/orderslines     | Liste des réservations de session    |
| GET     | /api/orderslines/:id | Détail d'une réservation de session  |
| POST    | /api/orderslines     | Créer une réservation de session     |
| PUT     | /api/orderslines/:id | Modifier une réservation de session  |
| DELETE  | /api/orderslines/:id | Supprimer une réservation de session |

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

<!-- | POST    | /api/users     | Créer utilisateur     |
| PUT     | /api/users/:id | Modifier utilisateur  |
| DELETE  | /api/users/:id | Supprimer utilisateur | -->
