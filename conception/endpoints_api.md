# 📡 Endpoints API
> État au 2026-05-26 — branche `global-audit-and-fixes`

---

## 🔑 Authentification

| Méthode | Endpoint              | Auth requise | Description                    |
|---------|-----------------------|--------------|--------------------------------|
| POST    | /api/auth/register    | —            | Créer un compte utilisateur    |
| POST    | /api/auth/login       | —            | Se connecter                   |
| POST    | /api/auth/refresh     | —            | Rafraîchir le token JWT        |
| POST    | /api/auth/logout      | —            | Se déconnecter                 |
| GET     | /api/auth/profile     | member, admin| Obtenir son profil utilisateur |

---

## 📂 Categories

| Méthode | Endpoint                      | Auth requise | Description              |
|---------|-------------------------------|--------------|--------------------------|
| GET     | /api/categories               | —            | Liste catégories         |
| GET     | /api/categories/by-slug/:slug | —            | Détail catégorie par slug|
| GET     | /api/categories/:id           | —            | Détail catégorie par id  |
| POST    | /api/categories               | admin        | Créer catégorie          |
| PUT     | /api/categories/:id           | admin        | Modifier catégorie       |
| DELETE  | /api/categories/:id           | admin        | Supprimer catégorie      |

---

## 🎯 Activities

| Méthode | Endpoint                      | Auth requise | Description              |
|---------|-------------------------------|--------------|--------------------------|
| GET     | /api/activities               | —            | Liste activités          |
| GET     | /api/activities/by-slug/:slug | —            | Détail activité par slug |
| GET     | /api/activities/:id           | —            | Détail activité par id   |
| POST    | /api/activities               | admin        | Créer activité           |
| PUT     | /api/activities/:id           | admin        | Modifier activité        |
| DELETE  | /api/activities/:id           | admin        | Supprimer activité       |

---

## 📅 Sessions

| Méthode | Endpoint          | Auth requise | Description       |
|---------|-------------------|--------------|-------------------|
| GET     | /api/sessions     | —            | Liste sessions    |
| GET     | /api/sessions/:id | —            | Détail session    |
| POST    | /api/sessions     | admin        | Créer session     |
| PUT     | /api/sessions/:id | admin        | Modifier session  |
| DELETE  | /api/sessions/:id | admin        | Supprimer session |

---

## 🧾 Orders

| Méthode | Endpoint          | Auth requise  | Description                        |
|---------|-------------------|---------------|------------------------------------|
| GET     | /api/orders       | admin         | Liste toutes les commandes         |
| GET     | /api/orders/mine  | member, admin | Liste mes commandes                |
| GET     | /api/orders/:id   | member, admin | Détail d'une commande              |
| POST    | /api/orders       | member, admin | Créer une commande                 |
| PUT     | /api/orders/:id   | member, admin | Modifier le statut d'une commande  |
| DELETE  | /api/orders/:id   | member, admin | Supprimer une commande (Pending)   |

---

## 📋 Orders Lines

| Méthode | Endpoint              | Auth requise  | Description                          |
|---------|-----------------------|---------------|--------------------------------------|
| GET     | /api/orders_lines     | admin         | Liste toutes les lignes de commande  |
| GET     | /api/orders_lines/:id | member, admin | Détail d'une ligne de commande       |
| POST    | /api/orders_lines     | member, admin | Créer une ligne de commande          |
| PUT     | /api/orders_lines/:id | member, admin | Modifier une ligne de commande       |
| DELETE  | /api/orders_lines/:id | member, admin | Supprimer une ligne de commande      |

---

## 👥 Users

| Méthode | Endpoint       | Auth requise  | Description          |
|---------|----------------|---------------|----------------------|
| GET     | /api/users     | admin         | Liste utilisateurs   |
| GET     | /api/users/:id | member, admin | Détail utilisateur   |
| PUT     | /api/users/:id | member, admin | Modifier utilisateur |
| DELETE  | /api/users/:id | member, admin | Supprimer compte     |

---

## 🔐 Roles

| Méthode | Endpoint      | Auth requise  | Description     |
|---------|---------------|---------------|-----------------|
| GET     | /api/roles    | admin         | Liste des rôles |
| GET     | /api/roles/:id| member, admin | Détail d'un rôle|

---

## 🖼️ Upload (images activités)

| Méthode | Endpoint                   | Auth requise | Description                          |
|---------|----------------------------|--------------|--------------------------------------|
| POST    | /api/upload/activity-banner| admin        | Upload image bannière d'une activité |
| POST    | /api/upload/activity-thumb | admin        | Upload image miniature d'une activité|

> Les fichiers sont stockés dans `vite-frontend/public/images/banners/` et `/thumbs/`.
> Le nom de fichier est passé dans le body (`filename`). Format attendu : `.webp`.
