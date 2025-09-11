# 📡 Endpoints API

---

## 🔑 Authentification & création Utilisateur

| Méthode | Endpoint         | Description                        |
|---------|------------------|------------------------------------|
| POST    | /api/register    | Créer un compte utilisateur        |
| POST    | /api/login       | Se connecter                       |
| GET     | /api/profile     | Obtenir le profil de l’utilisateur |
| PUT     | /api/profile/:id | Mettre à jour le profil            |
| DELETE  | /api/profile/:id | Supprimer son compte               |

---

## 📂 Category

| Méthode | Endpoint          | Description         |
|---------|-------------------|---------------------|
| GET     | /api/category     | Liste catégories    |
| GET     | /api/category/:id | Détail catégorie    |
| POST    | /api/category     | Créer catégorie     |
| PUT     | /api/category/:id | Modifier catégorie  |
| DELETE  | /api/category/:id | Supprimer catégorie |

---

## 📂 Activity

| Méthode | Endpoint          | Description         |
|---------|-------------------|---------------------|
| GET     | /api/activity     | Liste Activités     |
| GET     | /api/activity/:id | Détail Activité     |
| POST    | /api/activity     | Créer Activité      |
| PUT     | /api/activity/:id | Modifier Activité   |
| DELETE  | /api/activity/:id | Supprimer Activité  |

---

## 📂 ActivitySession

| Méthode | Endpoint          | Description         |
|---------|-------------------|---------------------|
| GET     | /api/session      | Liste sessions      |
| GET     | /api/session/:id  | Détail session      |
| POST    | /api/session      | Créer session       |
| PUT     | /api/session/:id  | Modifier session    |
| DELETE  | /api/session/:id  | Supprimer session   |

---

### Order

| Méthode | Endpoint       | Description                          |
|---------|----------------|--------------------------------------|
| GET     | /api/order     | Liste des réservations de session    |
| GET     | /api/order/:id | Détail d'une réservation de session  |
| POST    | /api/order     | Créer une réservation de session     |
| PUT     | /api/order/:id | Modifier une réservation de session  |
| DELETE  | /api/order/:id | Supprimer une réservation de session |

---

## 🧾 Cart

| Méthode | Endpoint      | Description                           |
|---------|---------------|---------------------------------------|
| GET     | /api/cart     | Liste des commandes                   |
| GET     | /api/cart/:id | Détail d’une commande                 |
| POST    | /api/cart     | Créer une commande                    |
| PUT     | /api/cart/:id | Modifier une commande                 |
| DELETE  | /api/cart/:id | Supprimer une commande (non payée)    |

---

## 👥 User

| Méthode | Endpoint       | Description           |
|---------|----------------|-----------------------|
| GET     | /api/users     | Liste utilisateurs    |
| GET     | /api/users/:id | Détail utilisateur    |
| POST    | /api/users     | Créer utilisateur     |
| PUT     | /api/users/:id | Modifier utilisateur  |
| DELETE  | /api/users/:id | Supprimer utilisateur |
