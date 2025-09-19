# 🧩 Workflow projet ZombieLand

## ⚡️ Exemple rapide (nouveau dev)

```bash
git clone git@github.com:5h4r0/ZombieLandSolo-CDA.git
cd backend
npm install
# Option A: partir du SQL existant
npm run db:sql
npm run db:pull
npm run db:format
# Option B: partir du schema.prisma (crée la DB + migration init)
npm run db:create
npm run dev
```

---

## 📂 Arborescence recommandée

```
backend/
├── src/
│   ├── index.ts               # Point d'entrée du serveur
│   ├── models/                # Logique liée aux données
│   │   ├── schema.prisma      # Schéma Prisma (source de vérité DB)
│   │   ├── migrations/        # Migrations générées par Prisma
│   │   └── seeding.ts         # Script de seed pour la DB
│   ├── routers/               # Routes de l’API (Express)
│   ├── controllers/           # Logique métier (optionnel)
│   └── middlewares/           # Middlewares (optionnel)
├── package.json
├── tsconfig.json
└── .env                       # Variables d'environnement (DATABASE_URL, etc.)
```


---

## ⚙️ Fichier de variables d'environnement `.env`

```
# Connexion PostgreSQL
DATABASE_URL="postgresql://zombiezone:zombiezone@localhost:5432/zombiezone"

# Port d’application
PORT=3000

ADMIN_EMAIL=prenom@domaine.fr
ADMIN_FIRSTNAME=Prénom
ADMIN_LASTNAME=Nom
ADMIN_PASSWORD=
BCRYPT_SALT_ROUNDS=10
```

---

## ⚙️ Setup initial

1. Installer les dépendances  
```bash
npm install
```

2. Créer la base à partir du SQL, injecter dans schema.prisma, formater si nécessaire  
```bash
npm run db:sql
npm run db:pull
npm run db:format
```

  - *Ou depuis schema.prisma valide*
```bash
npm run db:create
```

3. Générer/mettre à jour le client Prisma (optionnel mais conseillé)  
```bash
npm run db:generate
```

4. Migration : si `schema.prisma` modifié  
```bash
npm run db:migrate
# ou pour nommer explicitement :
# npm run db:migrate -- --name <nom>
```

5. Reset (dev) : réinitialise la DB et rejoue le seed  
```bash
npm run db:reset
```

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
| `npm run dev`         | Lance le serveur en dev avec hot reload                          |
| `npm run db:sql`      | Applique le fichier SQL d’initialisation                          |
| `npm run db:pull`     | Récupère le schéma depuis la DB dans schema.prisma               |
| `npm run db:format`   | Formate le fichier schema.prisma                                  |
| `npm run db:create`   | Crée/applique la migration initiale à partir du schema.prisma     |
| `npm run db:migrate`  | Crée/applique une migration en dev                                |
| `npm run db:reset`    | Reset complet de la DB (drop, migrate, seed)                      |
| `npm run db:deploy`   | Applique les migrations en production                             |
| `npm run db:generate` | Génère le client Prisma                                           |
| `npm run db:seed`     | Lance le script de seed                                           |
| `npm run db:studio`   | Ouvre Prisma Studio (UI web pour la DB)                           |


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
