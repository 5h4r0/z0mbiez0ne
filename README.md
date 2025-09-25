# Workflow projet ZombieLand

## Exemple rapide (nouveau dev)

```bash
git clone git@github.com:5h4r0/ZombieLandSolo-CDA.git
cd backend
npm install
# Option A: partir du SQL existant
npm run db:sql
npm run db:pull
npm run db:format
# Option B: partir du schema.prisma (init DB + migration dev)
npm run db:dev
npm run dev

```

---

## Arborescence

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
│   │   └── categories.router.ts
│   ├── controllers/             # Logique métier
│   │   ├── activities.controller.ts
│   │   └── categories.controller.ts
│   └── utils/                   # Fonctions utilitaires (slugify, random, etc.)
├── package.json
├── tsconfig.json
├── .env                         # Variables d'environnement
└── .env.example                 # Exemple de configuration d'environnement

```

---

## Fichier de variables d'environnement `.env`

```
# --- Database ---
DATABASE_URL="postgresql://zombiezone:zombiezone@localhost:5432/zombiezone"

# --- Server ---
PORT=3000
NODE_ENV=development

# --- Admin ---
ADMIN_EMAIL=
ADMIN_FIRSTNAME=
ADMIN_LASTNAME=
ADMIN_PASSWORD=

# --- Security ---
BCRYPT_SALT_ROUNDS=10

# --- CORS ---
# En prod : domaine officiel (https://zombiezone.com)
# En dev : http://localhost:5173 pour React/Vite
CORS_ORIGIN_PROD=https://zombiezone.com
CORS_ORIGIN_PROD_ALT=http://zombiezone.com
CORS_ORIGIN_DEV=http://localhost:5173

```
---

## Setup initial

1. Installer les dépendances  
npm install

2. Créer la base à partir du SQL, injecter dans schema.prisma, formater si nécessaire  
npm run db:sql
npm run db:pull
npm run db:format

  - *Ou depuis schema.prisma valide*  
npm run db:dev

3. Générer/mettre à jour le client Prisma (optionnel mais conseillé)  
npm run db:gen

4. Migration : si `schema.prisma` modifié  
npm run db:dev
# ou pour nommer explicitement :
# npm run db:dev -- --name <nom>

5. Reset (dev) : réinitialise la DB et rejoue le seed  
npm run db:reset

---

## Développement

- Lancer le serveur :  
npm run dev

- Appliquer une migration après modification de `schema.prisma` :  
npm run db:dev

- Remplir la base avec des données de test :  
npm run db:seed

- Explorer la base via Prisma Studio :  
npm run db:studio


---

## Reset complet (local uniquement)

Supprime toutes les tables, rejoue toutes les migrations et relance le seed :  
```bash
npm run db:reset
```

---

## Production

- Appliquer toutes les migrations :  
```bash
npm run db:deploy
```

---

## Scripts disponibles

npm run dev → Lance le serveur en dev avec hot reload

npm run db:sql → Applique le fichier SQL d’initialisation

npm run db:pull → Récupère le schéma depuis la DB dans schema.prisma

npm run db:format → Formate le fichier schema.prisma

npm run db:dev → Crée/applique une migration en dev

npm run db:reset → Reset complet de la DB (drop, migrate, seed)

npm run db:deploy → Applique les migrations en production

npm run db:gen → Génère le client Prisma

npm run db:seed → Lance le script de seed

npm run db:studio → Ouvre Prisma Studio (UI web pour la DB)

---

## Note : commit types

*Avant de mettre vos branches de fonctionnalités sur la branche de dev, faites un merge de dev sur votre branche. Vous pourrez régler les potentiels conflits sur votre branche à vous avant de faire votre pull request. Ce qui fait que votre pull request passera à coup sûr.*


| Commit Type | Title                    | Description                                                                                                 | Emoji |
|-------------|--------------------------|-------------------------------------------------------------------------------------------------------------|:-----:|
| `feat`      | Features                 | A new feature                                                                                               |   ✨   |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   |  🐛   |
| `wip`       | WIP                      | Work in progress                                                                                            |  🚧   |
| `docs`      | Documentation            | Documentation only changes                                                                                  |  📚   |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (whitespace, formatting, missing semicolons, etc)        |  💎   |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |  📦   |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     |  🚀   |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           |  🚨   |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |  🛠   |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |  ⚙️   |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           |  ♻️   |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   |  🗑   |
