# DEPLOY.md — zombiezone

Procédure de déploiement complète et pièges connus. Rédigée après déploiement réel sur VPS Ionos.

---

## Environnements

| Domaine                    | Rôle       | Base de données           |
|----------------------------|------------|---------------------------|
| `localhost:3000` / `:5173` | Dev local  | PostgreSQL local (Docker) |
| `sharo.fr`                 | Production | PostgreSQL VPS Ionos      |

**Hébergement** : VPS Ionos — Ubuntu 24.04 — 2 vCPU / 2 GB RAM / 80 GB NVMe — IP : 82.165.180.54

---

## Architecture Docker

```
services :
  db        → PostgreSQL 16 Alpine — port 5432 (interne uniquement)
  backend   → Node.js 22 Alpine (Express) — port 3000 (interne uniquement)
  frontend  → Nginx Alpine servant le build Vite — ports 80/443
```

⚠️ Le port PostgreSQL **ne doit pas être exposé** publiquement — accès interne Docker uniquement.

---

## Fichiers Docker prod

| Fichier                      | Rôle                                                        |
|------------------------------|-------------------------------------------------------------|
| `docker/Dockerfile.backend`  | Multi-stage Node 22 Alpine — build TS + runner prod         |
| `docker/Dockerfile.frontend` | Multi-stage Node 22 Alpine + Nginx Alpine                   |
| `docker/nginx.conf`          | Redirect HTTP→HTTPS, proxy `/api/` → backend, SPA fallback |
| `docker-compose.prod.yml`    | Orchestration db/backend/frontend                           |

### Structure dans le container backend (`/app/`)

```
/app/
├── package.json
├── package-lock.json
├── node_modules/
└── backend/
    ├── dist/              ← build TypeScript compilé
    ├── src/               ← sources copiées (pour seed + migrations)
    │   └── models/
    │       ├── schema.prisma
    │       ├── migrations/   ← migrations SQL
    │       └── seeding.ts
    └── prisma/
        └── migrations → symlink vers src/models/migrations
```

⚠️ Le symlink `backend/prisma/migrations` est créé dans le Dockerfile — Prisma cherche les migrations dans `prisma/migrations` par défaut (relatif au CWD).

---

## Variables d'environnement

### Dev local — `backend/.env` (gitignored)

```dotenv
DATABASE_URL="postgresql://username:password@localhost:5432/zombiezone"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_SECRET=<dev-secret>
JWT_REFRESH_SECRET=<dev-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_EMAIL=admin@zombiezone.fr
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=ZombieZone
ADMIN_PASSWORD=<mot-de-passe-test>
LOG_LEVEL=info
```

### Production — `backend/.env.production` (gitignored, sur VPS uniquement)

```dotenv
DATABASE_URL="postgresql://zombiezone:<PASSWORD>@db:5432/zombiezone"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://sharo.fr
JWT_ACCESS_SECRET=<SECRET-FORT-64-BYTES>
JWT_REFRESH_SECRET=<SECRET-FORT-64-BYTES-DIFFERENT>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_EMAIL=<email-admin>
ADMIN_FIRSTNAME=<prenom>
ADMIN_LASTNAME=<nom>
ADMIN_PASSWORD=<mot-de-passe-sans-$>
LOG_LEVEL=warn
```

⚠️ **Ne pas utiliser `$` dans `ADMIN_PASSWORD`** — le shell l'interprète même dans les fichiers `.env`.

⚠️ `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` **doivent être définis** — le serveur throw au démarrage sinon.

Générer des secrets forts :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Racine VPS — `/srv/zombiezone/.env` (jamais dans le repo)

```dotenv
POSTGRES_USER=zombiezone
POSTGRES_PASSWORD=<même password que DATABASE_URL>
```

⚠️ Le mot de passe doit être **identique** dans les deux fichiers.

---

## Première installation VPS

### 1. Provisionner le VPS

```bash
# Depuis WSL2 local
ssh root@<ip-vps>
passwd
adduser steph
usermod -aG sudo steph

# Copier clé SSH (depuis WSL2 local)
ssh-copy-id steph@<ip-vps>

# Sécuriser SSH
nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
sudo systemctl restart ssh
```

### 2. Installer Docker

```bash
sudo apt update && sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker steph
# Se déconnecter/reconnecter pour activer le groupe docker
```

### 3. Cloner le repo

```bash
cd /srv
git clone https://github.com/5h4r0/z0mbiez0ne.git zombiezone
sudo chown -R steph:steph /srv/zombiezone
cd zombiezone
git checkout deploy
```

### 4. Créer les fichiers secrets

```bash
nano /srv/zombiezone/backend/.env.production   # voir template ci-dessus
nano /srv/zombiezone/.env                      # POSTGRES_USER + POSTGRES_PASSWORD
```

### 5. SSL — Let's Encrypt (Certbot)

```bash
sudo apt install -y certbot
# Le port 80 doit être libre (containers pas encore démarrés)
sudo certbot certonly --standalone -d sharo.fr
# Certificats dans /etc/letsencrypt/live/sharo.fr/
```

⚠️ Ne pas inclure `www.sharo.fr` si l'enregistrement DNS n'existe pas.

### 6. Build et démarrage

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 7. Migrations

```bash
docker compose -f docker-compose.prod.yml exec -w /app/backend backend \
  npx prisma migrate deploy --schema=./src/models/schema.prisma
```

### 8. Seed initial (une seule fois)

```bash
# Installer les devDependencies temporairement dans le container
docker compose -f docker-compose.prod.yml exec -e NODE_ENV=development backend \
  npm install --workspace=backend

# Lancer le seed
docker compose -f docker-compose.prod.yml exec -w /app/backend backend \
  npx tsx --env-file=../backend/.env.production ./src/models/seeding.ts
```

⚠️ `tsx` et `@faker-js/faker` sont des devDependencies — nécessitent `NODE_ENV=development` pour l'install.

---

## Mise à jour

```bash
cd /srv/zombiezone
git pull origin deploy
docker compose -f docker-compose.prod.yml up -d --build
# Si nouvelles migrations :
docker compose -f docker-compose.prod.yml exec -w /app/backend backend \
  npx prisma migrate deploy --schema=./src/models/schema.prisma
```

## Redémarrage sans rebuild

```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## Renouvellement SSL

Certbot renouvelle automatiquement. Pour forcer :

```bash
docker compose -f docker-compose.prod.yml stop frontend
sudo certbot renew
docker compose -f docker-compose.prod.yml start frontend
```

---

## Base de données

### Backup manuel

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U zombiezone zombiezone > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U zombiezone zombiezone
```

### Reset complet (⚠️ détruit toutes les données)

```bash
docker compose -f docker-compose.prod.yml down
docker volume rm zombiezone_pgdata
docker compose -f docker-compose.prod.yml up -d
```

### Shutdown, Start

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## DNS — Ionos

```
sharo.fr   A   82.165.180.54
```

---

## Pièges connus

| Piège | Cause | Fix |
|-------|-------|-----|
| `npm ci` échoue avec "Missing from lock file" | `package.json` modifié sans `npm install` | `npm install` en local puis commit `package-lock.json` |
| `Cannot find package X` au runtime | Package en `devDependencies` au lieu de `dependencies` | Déplacer dans `dependencies` + `npm install` + commit lock |
| `prisma generate` manquant avant `tsc` | Types Prisma non générés au moment du build TS | `prisma generate` dans le stage `builder` avant `npm run build` |
| `No migration found in prisma/migrations` | Prisma cherche `prisma/migrations` relatif au CWD | Symlink `backend/prisma/migrations` → `backend/src/models/migrations` |
| Cookie `secure` rejeté | HTTP sans SSL | Configurer SSL (Certbot) |
| `ADMIN_PASSWORD` mal interprété | `$` interprété par le shell | Éviter `$` dans les mots de passe des fichiers `.env` |
| Credentials PostgreSQL invalides | Mot de passe différent entre `.env` et `.env.production` | Vérifier que `POSTGRES_PASSWORD` = password dans `DATABASE_URL` |

---

## Checklist avant déploiement

- [ ] `npm run build` sans erreur TypeScript (backend)
- [ ] `npm run build` sans erreur (frontend)
- [ ] `npm run lint:prod` propre (Biome)
- [ ] `package-lock.json` synchronisé (`npm install` après tout ajout de dépendance)
- [ ] Migrations à jour dans le repo (`backend/src/models/migrations/` versionné)
- [ ] `backend/.env.production` présent sur le VPS
- [ ] `.env` racine présent sur le VPS
- [ ] JWT secrets forts (64 bytes, générés avec `crypto.randomBytes`)
- [ ] `ALLOWED_ORIGINS=https://sharo.fr`
- [ ] `ADMIN_PASSWORD` sans `$`
- [ ] Port PostgreSQL non exposé publiquement
- [ ] SSL Let's Encrypt configuré
- [ ] DNS `sharo.fr` → `82.165.180.54`