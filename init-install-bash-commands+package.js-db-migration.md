*/!\	wsl : projects with docker or prisma must be in /home/ only*

# Initialisation projet, install premières dépendances

```
npm init

npm install postgres

npm install express

npm i --save-dev @types/express

npm i -D --save-exact @biomejs/biome

npx @biomejs/biome format --write ./src

create prisma.schema 

npm install prisma --save-dev

npx prisma

npm install @prisma/client

npm install bcryptjs

npm install dotenv

npm install --save-dev dotenv-cli
```

*En production : pour la prod : build dans /dist/*

```
npx tsc --init		
```

---

## Prisma & schema.prisma

### DB-first Workflow (fichier SQL de référence OK)

*db pull → on a déjà une DB/tables → Prisma lit la structure → génère les model { ... } dans le schema.prisma.
L'inverse : migrate dev → on écrit les modèles Prisma → Prisma génère du SQL → applique à la DB.*

**1/ Peupler la DB avant le pull** vers le schema.prisma : *Depuis sharo@Hastur:~/projects/ZombieLand/backend$* par exemple :

```
psql "postgresql://zombiezone:zombiezone@localhost:5432/zombiezone" -f ./src/models/postgres_schema.psql
```

"db:sql": "dotenv -e .env -- sh -c 'psql \"$DATABASE_URL\" -f ./src/models/postgres_schema.psql'"

**2/ Remplir le schema.prisma** à partir de la DB - Vérifier que tes tables existent dans ta DB - psql \dt :
```
npx prisma db pull --schema=./src/models/schema.prisma

npx prisma format
```

**3/ db pull OK, schema.prisma généré** : Création du Prisma Client (@prisma/client) à jour avec les modèles
```
npx prisma generate --schema=./src/models/schema.prisma
```

---

### Prisma-first Workflow (mise en place structure DB depuis schema.prisma)

```
npm install
npm run db:create
npm run db:seed
npm run dev
```

**Migration : si schema.prisma modifié**

```
npm run db:migrate
```

**Migration : repartir de zéro**

```
npm run db:reset
npm run db:migrate
```

**seeding - ajouter des données de test**

```
npm install @faker-js/faker --save-dev
```

*⚠️ Génère et applique la première migration (init). Une seule fois pour initialiser le projet Prisma. Ensuite, db:migrate:dev.*

*--create-only : Prisma recrée la DB from scratch* - définition dans package.json
"db:create": "prisma migrate dev --schema=./src/models/schema.prisma --name init --create-only"
*ou*
"db:create": "prisma migrate dev --schema=./src/models/schema.prisma --name init"

---

## Première initialisation

```
npm run db:sql
npx prisma migrate dev --schema=./src/models/schema.prisma --name init --create-only
```

---

## Migrations

#### Note package.json

"db:sql": "psql \"$DATABASE_URL\" -f ./src/models/postgres_schema.psql"
Applique directement le script .sql dans Postgres (et garder le fichier .sql comme source de vérité)

---

```
"scripts": {
// DB-first ----
  "db:sql": "dotenv -e .env -- psql \"$DATABASE_URL\" -f ./src/models/postgres_schema.psql",
  "db:pull": "prisma db pull --schema=./src/models/schema.prisma",
  "db:format": "prisma format --schema=./src/models/schema.prisma",

 // Commun ----
  "db:generate": "prisma generate --schema=./src/models/schema.prisma",
  "db:seed": "tsx --env-file=.env ./src/models/seeding.ts",
  "db:studio": "prisma studio --schema=./src/models/schema.prisma",

// Prisma-first ----
  "db:create": "prisma migrate dev --schema=./src/models/schema.prisma --name init",
  "db:migrate": "prisma migrate dev --schema=./src/models/schema.prisma",
  "db:reset": "prisma migrate reset --force --schema=./src/models/schema.prisma",
  "db:deploy": "prisma migrate deploy --schema=./src/models/schema.prisma"
}
```

---

### Workflows DB-first | Prisma-first

- Installer dotenv CLI pour la commande db:sql avec → *dotenv -e .env --*

*db:sql → db:pull → db:create/init → db:migrate (si schéma modifié) → db:reset → db:generate → db:seed → db:studio → db:deploy*

- **DB-first: db:sql → db:pull → db:format → db:generate → db:seed**

- **Prisma-first: modification schema.prisma → db:migrate --name ... → db:generate → db:seed → db:deploy (CI/prod)**

*Renommer --name selon chaque migration.*

```
npm run db:migrate -- --name add_sessions_fk_for_example
```

*db:reset (Prisma-first) drop la base et rejoue toutes les migrations Prisma (pas les éventuels scripts SQL)
→ dangereux si données locales.*

---

db:sql 👉 charge le SQL et l'applique à la DB PostgreSQL

`db:pull 👉 lit le **schéma** réel de la **DB PostgreSQL** (tables, colonnes, relations) et réécrit **schema.prisma** depuis la structure de la DB`

*db:init 👉 dit à Prisma : "état initial, à partir de maintenant tu gères les migrations" - __peu utile__*

db:create 👉 crée la une migration SQL à partir du `schema.prisma` (ex: init), et l’applique à la DB - première migration init par convention

`db:migrate 👉 quand schema.prisma modifié *en dev*, lit le schéma et met à jour la DB` | db:create est identique, mais utilisé par convention avec -- name init pour la 1ère migration

`db:generate 👉 Prisma génère un nouveau Prisma Client qui colle exactement au schema.prisma | **le code applicatif se base dessus**`

db:seed 👉 insérer des données de test en DB

db:reset 👉 reset complet (tables drop + migrations rejouées + seed)

db:studio 👉 UI pour naviguer dans la DB

db:deploy 👉 en prod, pour appliquer les migrations déjà créées

---

## 🚀 Workflow simplifié

*1ère migration vers DB (init)*
```
npm run db:create --name init
```

*si schema.prisma modifié*
```
npm run db:migrate --name {modifications}
```

*reset complet en local*
```
npm run db:reset
```

*seed*
```
npm run db:seed
```

---

*prod déploiement*
```
npm run db:deploy
```

## Seeding

✅ Résumé pratique

Mettre skipDuplicates: true en seeding uniquement pour :
- users.createMany → emails uniques
- roles.createMany → si relancé plusieurs fois
- activities_categories.createMany → clé composite unique
- orders_lines.createMany → clé composite unique
- Inutile pour categories, activities, sessions, orders (Pas de @unique. Faker peut générer le même titre deux fois, mais pas d’erreur SQL)




---

## note : commit types

*Avant de mettre vos branches de fonctionnalités sur la branche de dev, faites un merge de dev sur votre branche. Vous pourrez régler les potentiels conflits sur votre branche à vous avant de faire votre pull request. Ce qui fait que votre pull request passera à coup sûr.*


| Commit Type | Title                    | Description                                                                                                 | Emoji |
|-------------|--------------------------|-------------------------------------------------------------------------------------------------------------|:-----:|
| `feat`      | Features                 | A new feature                                                                                               |   ✨   |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   |  🐛   |
| `wip`       | WIP                      | Work in progress                                                                                            |  🐛   |
| `docs`      | Documentation            | Documentation only changes                                                                                  |  📚   |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |  💎   |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |  📦   |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     |  🚀   |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           |  🚨   |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |  🛠   |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |  ⚙️   |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           |  ♻️   |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   |  🗑   |