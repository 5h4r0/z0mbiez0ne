# 🧩 Workflow projet ZombieLand

## ⚡️ Exemple rapide (nouveau dev)

```bash
git clone git@github.com:5h4r0/ZombieLandSolo-CDA.git
cd ZombieLand/backend
npm install
npm run db:create:sql
npm run db:init
npm run dev
```

---

## 📂 Arborescence recommandée

```
backend/
├── prisma/                    # Contient les migrations générées par Prisma
│   └── migrations/            
├── src/
│   ├── index.ts               # Point d'entrée du serveur
│   ├── models/                # Logique liée aux données
│   │   ├── schema.prisma      # Schéma Prisma (source de vérité DB)
│   │   └── seeding.ts         # Script de seed pour la DB
│   ├── routes/                # Routes de l’API
│   ├── controllers/           # Logique métier
│   └── middlewares/           # Middlewares Express/Nest/etc.
├── package.json
├── tsconfig.json
└── .env                       # Variables d'environnement (DATABASE_URL, etc.)
```


---

## ⚙️ Exemple de `.env` minimal

```
# Connexion PostgreSQL
DATABASE_URL="postgresql://zombiezone:zombiezone@localhost:5432/zombiezone?schema=public"

# Exemple de port d’application
PORT=3000
```

⚠️ Adapter `user:password@host:port/dbname` selon la configuration PostgreSQL.  

---

## ⚙️ Setup initial

1. Installer les dépendances  
```bash
npm install
```

2. Créer la base à partir du SQL (une seule fois)  
```bash
npm run db:create:sql
```

  - *Ou depuis shema.prisma*
```bash
npm run db:create
```

3. Enregistrer l’état initial des migrations Prisma  
```bash
npm run db:init
```
- ** Si schema.prisma OK (ne pas partir du chier SQL)
  → pas besoin de `db:init`, Prisma crée la base et suit les migrations directement.  


---

## 🚀 Développement

- Lancer le serveur :  
```bash
npm run dev
```

- Appliquer une migration après modification de `schema.prisma` :  
```bash
npm run db:migrate
```

- Remplir la base avec des données de test :  
```bash
npm run db:seed
```

- Explorer la base via Prisma Studio :  
```bash
npm run db:studio
```

---

## 🔄 Reset complet (local uniquement)

Supprime toutes les tables, rejoue toutes les migrations et relance le seed :  
```bash
npm run db:reset
```

---

## 📦 Production

- Appliquer toutes les migrations :  
```bash
npm run db:deploy
```

---

## 📜 Scripts disponibles

| Commande                | Description                                                        |
|-------------------------|--------------------------------------------------------------------|
| `npm run dev`           | Lance le serveur en dev avec hot reload                            |
| `npm run db:create:sql` | Applique le fichier SQL d’initialisation (une seule fois au début) |
| `npm run db:init`       | Crée la migration initiale Prisma sans toucher à la DB             |
| `npm run db:migrate`    | Crée/applique une migration en dev                                 |
| `npm run db:reset`      | Reset complet de la DB (drop, migrate, seed)                       |
| `npm run db:deploy`     | Applique les migrations en production                              |
| `npm run db:generate`   | Génère le client Prisma                                            |
| `npm run db:seed`       | Lance le script de seed                                            |
| `npm run db:studio`     | Ouvre Prisma Studio (UI web pour la DB)                            |


---

## note : commit types

*Avant de mettre vos branches de fonctionnalités sur la branche de dev, faites un merge de dev sur votre branche. Vous pourrez régler les potentiels conflits sur votre branche à vous avant de faire votre pull request. Ce qui fait que votre pull request passera à coup sûr.*


| Commit Type | Title                    | Description                                                                                                 | Emoji |
|-------------|--------------------------|-------------------------------------------------------------------------------------------------------------|:-----:|
| `feat`      | Features                 | A new feature                                                                                               |   ✨   |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   |  🐛   |
| `wip`       | WIP                      | Work in progress                                                                                            |  🚧   |
| `docs`      | Documentation            | Documentation only changes                                                                                  |  📚   |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |  💎   |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |  📦   |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     |  🚀   |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           |  🚨   |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |  🛠   |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |  ⚙️   |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           |  ♻️   |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   |  🗑   |