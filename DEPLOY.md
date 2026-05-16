# DEPLOY.md — zombiezone

Procédure de déploiement et pièges connus.

---

## Environnements

| Domaine                        | Rôle       | Base de données          |
|--------------------------------|------------|--------------------------|
| `localhost:3000` / `:5173`     | Dev local  | PostgreSQL local (Docker)|
| `zombiezone.kadath.fr`         | Production | PostgreSQL VPS           |

> **Hébergement** : VPS — Ionos ou équivalent. À définir. Pas de Firebase / Supabase.

---

## Architecture Docker

Le projet tourne entièrement en Docker en prod.

```
services :
  backend     → Node.js (Express) — port 3000
  frontend    → Nginx servant le build Vite — port 80/443
  db          → PostgreSQL — port 5432 (interne uniquement)
```

⚠️ Le port PostgreSQL **ne doit pas être exposé** publiquement en prod — accès interne Docker uniquement.

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

### Production — `backend/.env.production`

```dotenv
DATABASE_URL="postgresql://user:password@db:5432/zombiezone"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://zombiezone.kadath.fr
JWT_ACCESS_SECRET=<SECRET-FORT-REQUIS>
JWT_REFRESH_SECRET=<SECRET-FORT-REQUIS>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=warn
```

⚠️ `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` **doivent être définis** — le serveur throw au démarrage sinon (`NODE_ENV=production` + secret par défaut = erreur fatale).

Stocker les secrets hors du repo : variables d'environnement VPS, secrets Docker, ou fichier `.env.production` non commité.

---

## Déploiement VPS

### Première installation

```bash
# Cloner le repo sur le VPS
git clone <repo-url> /srv/zombiezone
cd /srv/zombiezone

# Copier et remplir les secrets
cp backend/.env.example backend/.env.production
nano backend/.env.production  # remplir DATABASE_URL, JWT secrets, etc.

# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build

# Migrations prod (sans prompt)
docker compose exec backend npm run db:deploy
```

### Mise à jour

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec backend npm run db:deploy
```

Forcer un redémarrage sans changement de code :

```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## Base de données

### Dev local — reset complet

```bash
npm run db:reset   # ⚠️ drop + re-migrate + seed
```

### Prod — migrations uniquement (jamais de reset)

```bash
npm run db:deploy  # applique les migrations sans prompt
```

### Régénérer le client Prisma après modif du schema

```bash
npm run db:gen
```

### Ajouter une migration

```bash
npm run db:dev -- --name <nom_migration>
# ex : npm run db:dev -- --name add_comments_table
```

---

## DNS — Ionos

Pour `zombiezone.kadath.fr` pointer vers le VPS :

```
CNAME  zombiezone   <ip-ou-hostname-vps>
```

Ou enregistrement A direct :

```
A  zombiezone   <ip-vps>
```

SSL : généré via **Let's Encrypt** (Certbot ou Traefik) sur le VPS — rien à acheter.

---

## Reverse proxy (Nginx / Traefik)

En prod, un reverse proxy devant Docker est recommandé pour :
- Terminer SSL (HTTPS)
- Router `zombiezone.kadath.fr` → container frontend (port 80)
- Router `zombiezone.kadath.fr/api` → container backend (port 3000)

---

## Checklist avant déploiement

- [ ] `npm run build` sans erreur TypeScript (backend)
- [ ] `npm run build` sans erreur (frontend)
- [ ] `npm run lint:prod` propre (Biome)
- [ ] Migrations à jour (`db:deploy` prévu)
- [ ] `.env.production` rempli avec secrets forts
- [ ] JWT secrets différents de la valeur par défaut
- [ ] `ALLOWED_ORIGINS` restreint au domaine prod
- [ ] Port PostgreSQL non exposé publiquement
