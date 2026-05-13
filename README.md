# 🧟 The z0mbie z0ne — Backend

## 🚀 Setup initial

1. Installer les dépendances :
```bash
npm install
```

2. **Prisma-first** (à partir d’un `schema.prisma` déjà écrit) :
```bash
npm run db:dev
```

*Si besoin d'un nom de migration, comme "init" pour la première*
```bash
npm run db:dev -- --name <nom>
```

3. **DB-first** (à partir du SQL existant) :
```bash
npm run db:sql
npm run db:pull
npm run db:format
npm run db:generate
```

4. Migration (si `schema.prisma` modifié) :
```bash
npm run db:dev -- --name <nom>
```

5. Reset complet (drop + migrations) :
```bash
npm run db:reset
```

6. Seeding (insérer données de test) :
```bash
npm run db:seed
```

---

## 💻 Développement

- Lancer le serveur :
```bash
npm run dev
```

- Explorer la base avec Prisma Studio :
```bash
npm run db:studio
```

---

## 📦 Production

- Appliquer toutes les migrations en prod :
```bash
npm run db:deploy
```

- Lancer le serveur compilé :
```bash
npm run build
npm start
```

---

## 📂 Arborescence

```
backend/
├── src/
│   ├── index.ts                 # Point d'entrée du serveur
│   ├── config/                  # Configuration de l'application
│   │   ├── config.ts            # Variables et options centralisées
│   │   └── cors.ts              # Configuration CORS basée sur config.ts
│   ├── models/                  # Schéma et scripts liés à la base de données
│   │   ├── schema.prisma        # Schéma Prisma (source de vérité de la DB)
│   │   ├── migrations/          # Migrations générées par Prisma
│   │   ├── seeding.ts           # Script de seed
│   │   └── postgres_schema.psql # Script SQL d'initialisation (optionnel)
│   ├── routers/                 # Routes de l’API (Express)
│   │   ├── index.router.ts      # Point d'entrée des routes
│   │   ├── activities.router.ts
│   │   ├── categories.router.ts
│   │   ├── users.router.ts
│   │   ├── roles.router.ts
│   │   ├── sessions.router.ts   # (temp) renvoie users pour avancer l’auth
│   │   ├── orders.router.ts     # (temp) renvoie users pour avancer l’auth
│   │   └── order.lines.router.ts# (temp) renvoie users pour avancer l’auth
│   ├── controllers/             # Logique métier
│   │   ├── activities.controller.ts
│   │   ├── categories.controller.ts
│   │   ├── users.controller.ts
│   │   ├── roles.controller.ts
│   │   ├── sessions.controller.ts
│   │   ├── orders.controller.ts
│   │   └── orders.lines.controller.ts
│   └── utils/                   # Fonctions utilitaires (helpers)
│       ├── index.ts             # Barrel file (exports centralisés)
│       ├── slugify.ts
│       ├── getrandomint.ts
│       ├── cleanObject.ts
│       └── getPagination.ts
├── package.json
├── tsconfig.json
├── .env                         # Variables d'environnement
└── .env.example                 # Exemple de configuration d'environnement
```

---

## 🛡️ Note temporaire (routers *fake*)

Les routers **sessions**, **orders** et **order.lines** renvoient pour le moment les `users`, le temps d’avancer sur l’authentification **JWT** (login, refresh, middleware).

---

## 📜 Scripts disponibles

| Commande              | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `npm run dev`         | Lance le serveur en dev avec hot reload                                     |
| `npm run build`       | Compile TypeScript dans `/dist`                                             |
| `npm start`           | Démarre le serveur Node depuis `/dist`                                      |
| `npm run clean`       | Supprime le dossier `dist`                                                  |
| `npm run db:sql`      | Applique le script SQL `postgres_schema.psql` directement sur PostgreSQL    |
| `npm run db:pull`     | Récupère la structure réelle de la DB → `schema.prisma`                     |
| `npm run db:format`   | Formate le `schema.prisma`                                                  |
| `npm run db:generate` | Génère le client Prisma                                                     |
| `npm run db:seed`     | Lance le script de seed (`seeding.ts`)                                      |
| `npm run db:studio`   | Ouvre Prisma Studio (UI web DB)                                             |
| `npm run db:create`   | Crée/applique la migration init depuis `schema.prisma`                      |
| `npm run db:migrate`  | Crée/applique une migration supplémentaire (dev)                            |
| `npm run db:reset`    | Reset complet DB (drop, migrate, seed)                                      |
| `npm run db:deploy`   | Applique les migrations en production                                       |

---

## 🧩 Notes projet

- Pas de `if {}` dans le projet.  
  → Utiliser opérateurs logiques, ternaires, mapping d’objets, `.map`, `.filter`, `.reduce`.  
  → Favorise un code lisible, testable, fonctionnel.  

- Uniformiser les retours : toujours retourner une `Promise`, gérer erreurs avec `.catch` / `Promise.reject`.

- Paradigme adopté :  
  - Réponses JSON aplaties et harmonisées  
  - `.then` / `.catch` systématiques  
  - Pas de branches conditionnelles complexes  
  - Erreurs gérées par rejets explicites  

---

## 🗂️ Commit types

| Type        | Description                                       | Emoji |
|-------------|---------------------------------------------------|:-----:|
| `feat`      | Nouvelle fonctionnalité                           | ✨    |
| `fix`       | Correction de bug                                 | 🐛    |
| `wip`       | Work in progress                                  | 🚧    |
| `docs`      | Documentation                                     | 📚    |
| `style`     | Changement sans impact logique (formatage, etc.)  | 💎    |
| `refactor`  | Refactoring sans ajout ni correction              | 📦    |
| `perf`      | Amélioration performance                          | 🚀    |
| `test`      | Ajout/correction de tests                         | 🚨    |
| `build`     | Changements liés au build ou dépendances          | 🛠    |
| `ci`        | Changement config CI/CD                           | ⚙️    |
| `chore`     | Tâches diverses (hors code/test)                  | ♻️    |
| `revert`    | Annulation d’un commit précédent                  | 🗑    |
