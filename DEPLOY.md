# DEPLOY.md — zombiezone

Procédure de déploiement et pièges connus.

---

## Environnements

| Domaine                    | Rôle       | Base de données           |
|----------------------------|------------|---------------------------|
| `localhost:3000` / `:5173` | Dev local  | PostgreSQL local (Docker) |
| `sharo.fr`                 | Production | PostgreSQL VPS Ionos      |

**Hébergement** : VPS Ionos — Ubuntu 24.04 — 2 vCPU / 2 GB RAM / 80 GB NVMe — IP : 82.165.180.54

---

## Architecture Docker
services :
backend     → Node.js (Express) — port 3000
frontend    → Nginx servant le build Vite — port 80/443
db          → PostgreSQL — port 5432 (interne uniquement)

⚠️ Le port PostgreSQL **ne doit pas être exposé** publiquement en prod — accès interne Docker uniquement.

---

## Fichiers Docker prod

| Fichier                     | Rôle                                      |
|-----------------------------|-------------------------------------------|
| `docker/Dockerfile.backend` | Multi-stage Node 22 Alpine + argon2 build |
| `docker/Dockerfile.frontend`| Multi-stage Node 22 Alpine + Nginx        |
| `docker/nginx.conf`         | Proxy /api/ → backend:3000, SPA fallback  |
| `docker-compose.prod.yml`   | Orchestration db/backend/frontend         |

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

Template versionné : `backend/.env.example`

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
ADMIN_PASSWORD=<mot-de-passe-fort>
LOG_LEVEL=warn
```

### Racine VPS — `/srv/zombiezone/.env` (jamais dans le repo)

```dotenv
POSTGRES_USER=zombiezone
POSTGRES_PASSWORD=<même password que DATABASE_URL>
```

⚠️ `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` **doivent être définis** — le serveur throw au démarrage sinon.

Générer des secrets forts :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Déploiement VPS

### Première installation

```bash
# Cloner le repo
cd /srv
git clone https://github.com/5h4r0/z0mbiez0ne.git zombiezone
cd zombiezone
sudo chown -R steph:steph /srv/zombiezone
git checkout deploy

# Créer les fichiers secrets (jamais dans le repo)
nano backend/.env.production
nano .env

# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build

# Migrations prod
docker compose -f docker-compose.prod.yml exec backend npm run db:deploy

# Seed initial (une seule fois)
docker compose -f docker-compose.prod.yml exec backend npm run db:seed
```

### Mise à jour

```bash
cd /srv/zombiezone
git pull origin deploy
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npm run db:deploy
```

### Redémarrage sans rebuild

```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## SSL — Let's Encrypt (Certbot)

```bash
# Installer Certbot
sudo apt install -y certbot

# Générer le certificat (stopper Nginx Docker d'abord)
docker compose -f docker-compose.prod.yml stop frontend
sudo certbot certonly --standalone -d sharo.fr -d www.sharo.fr

# Les certificats sont dans /etc/letsencrypt/live/sharo.fr/
# Redémarrer
docker compose -f docker-compose.prod.yml up -d
```

Renouvellement automatique :
```bash
sudo certbot renew --dry-run
```

---

## Base de données

### Prod — migrations uniquement (jamais de reset)

```bash
docker compose -f docker-compose.prod.yml exec backend npm run db:deploy
```

### Backup manuel

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U zombiezone zombiezone > backup_$(date +%Y%m%d).sql
```

### Restauration

```bash
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U zombiezone zombiezone
```

---

## DNS — Ionos

Enregistrement A :
sharo.fr      A   82.165.180.54
www.sharo.fr  A   82.165.180.54

---

## Checklist avant déploiement

- [ ] `npm run build` sans erreur TypeScript (backend)
- [ ] `npm run build` sans erreur (frontend)
- [ ] `npm run lint:prod` propre (Biome)
- [ ] Migrations à jour (`db:deploy` prévu)
- [ ] `.env.production` présent sur le VPS
- [ ] `.env` racine présent sur le VPS
- [ ] JWT secrets forts (64 bytes)
- [ ] `ALLOWED_ORIGINS=https://sharo.fr`
- [ ] Port PostgreSQL non exposé publiquement
- [ ] SSL Let's Encrypt configuré
