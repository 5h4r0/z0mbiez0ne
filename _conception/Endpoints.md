# 📡 Endpoints API

Ce document décrit les endpoints REST de l’application en MVP, organisés par ressource.  
- Les endpoints publics sont accessibles sans authentification.
- Les endpoints `api/...` nécessitent un utilisateur authentifié (JWT).
- Les endpoints `api/admin/...` sont réservés aux administrateurs.

---

## 🔑 Authentification & Utilisateur

| Méthode | Endpoint             | Description                           |
|---------|----------------------|---------------------------------------|
| POST    | /api/auth/register   | Créer un compte utilisateur           |
| POST    | /api/auth/login      | Se connecter                          |
| GET     | /api/profile         | Obtenir le profil de l’utilisateur    |
| PUT     | /api/profile/:id     | Mettre à jour le profil               |
| DELETE  | /api/profile/:id     | Supprimer son compte                  |

---

## 📂 Categories

### Public
| Méthode | Endpoint                  | Description                      |
|---------|---------------------------|----------------------------------|
| GET     | /api/categories           | Liste des catégories             |
| GET     | /api/categories/:id       | Détail d’une catégorie (+ activités) |

### Admin
| Méthode | Endpoint                      | Description        |
|---------|-------------------------------|--------------------|
| GET     | /api/admin/categories         | Liste catégories   |
| GET     | /api/admin/categories/:id     | Détail catégorie   |
| POST    | /api/admin/categories         | Créer catégorie    |
| PUT     | /api/admin/categories/:id     | Modifier catégorie |
| DELETE  | /api/admin/categories/:id     | Supprimer catégorie |

---

## 🏷️ Activities

### Public
| Méthode | Endpoint              | Description                        |
|---------|-----------------------|------------------------------------|
| GET     | /api/activities       | Liste des activités                |
| GET     | /api/activities/:id   | Détail d’une activité (+ sessions) |

### Admin
| Méthode | Endpoint                   | Description        |
|---------|----------------------------|--------------------|
| GET     | /api/admin/activities      | Liste activités    |
| GET     | /api/admin/activities/:id  | Détail activité    |
| POST    | /api/admin/activities      | Créer activité     |
| PUT     | /api/admin/activities/:id  | Modifier activité  |
| DELETE  | /api/admin/activities/:id  | Supprimer activité |

---

## 📅 ActivitySessions

### Public
| Méthode | Endpoint              | Description                      |
|---------|-----------------------|----------------------------------|
| GET     | /api/sessions         | Liste des sessions (filtrage possible par activité) |
| GET     | /api/sessions/:id     | Détail d’une session             |

### Admin
| Méthode | Endpoint                  | Description        |
|---------|---------------------------|--------------------|
| GET     | /api/admin/sessions       | Liste sessions     |
| GET     | /api/admin/sessions/:id   | Détail session     |
| POST    | /api/admin/sessions       | Créer session      |
| PUT     | /api/admin/sessions/:id   | Modifier session   |
| DELETE  | /api/admin/sessions/:id   | Supprimer session  |

---

## 🧾 Orders (Commandes)

### Utilisateur
| Méthode | Endpoint              | Description                             |
|---------|-----------------------|-----------------------------------------|
| GET     | /api/orders           | Liste des commandes utilisateur         |
| GET     | /api/orders/:id       | Détail d’une commande (+ lignes)        |
| POST    | /api/orders           | Créer une commande (Draft → Pending)    |
| PUT     | /api/orders/:id       | Modifier une commande (confirmer/annuler) |
| DELETE  | /api/orders/:id       | Supprimer une commande (Draft ou Pending seulement) |

### OrderLines
| Méthode | Endpoint                                 | Description          |
|---------|------------------------------------------|----------------------|
| POST    | /api/orders/:orderId/lines               | Ajouter une ligne    |
| PUT     | /api/orders/:orderId/lines/:lineId       | Modifier une ligne   |
| DELETE  | /api/orders/:orderId/lines/:lineId       | Supprimer une ligne  |

### Admin
| Méthode | Endpoint                | Description        |
|---------|-------------------------|--------------------|
| GET     | /api/admin/orders       | Liste commandes    |
| GET     | /api/admin/orders/:id   | Détail commande    |
| POST    | /api/admin/orders       | Créer commande     |
| PUT     | /api/admin/orders/:id   | Modifier commande  |
| DELETE  | /api/admin/orders/:id   | Supprimer commande |

---

## 👥 Users (Admin)

| Méthode | Endpoint              | Description         |
|---------|-----------------------|---------------------|
| GET     | /api/admin/users      | Liste utilisateurs  |
| GET     | /api/admin/users/:id  | Détail utilisateur  |
| POST    | /api/admin/users      | Créer utilisateur   |
| PUT     | /api/admin/users/:id  | Modifier utilisateur|
| DELETE  | /api/admin/users/:id  | Supprimer utilisateur|
