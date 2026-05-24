# deploy-checklist.md — Déploiement zombiezone
> Charger pour toute tâche deploy, Docker, VPS, CI, migrations prod.

---

## Architecture prod

```
frontend  → Nginx (build Vite) — port 80/443
backend   → Node.js Express    — port 3000
db        → PostgreSQL         — port 5432 (interne Docker uniquement, jamais exposé)
```

Domaine : `zombiezone.kadath.fr` — VPS Ionos
Reverse proxy : Nginx ou Traefik (SSL Let's Encrypt / Certbot)

---

## Checklist avant deploy

- [ ] `npm run build` sans erreur TypeScript (backend)
- [ ] `npm run build` sans erreur (frontend)
- [ ] `npm run lint:prod` propre (Biome)
- [ ] Migrations à jour — `db:deploy` prévu
- [ ] `.env.production` rempli avec secrets forts
- [ ] `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` différents des valeurs par défaut
- [ ] `ALLOWED_ORIGINS=https://zombiezone.kadath.fr` (pas localhost)
- [ ] Port PostgreSQL non exposé publiquement

---

## Commandes deploy

### Première installation VPS
```bash
git clone <repo-url> /srv/zombiezone
cd /srv/zombiezone
cp backend/.env.example backend/.env.production
# remplir .env.production
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec backend npm run db:deploy
```

### Mise à jour
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec backend npm run db:deploy
```

---

## Variables .env.production

```dotenv
DATABASE_URL="postgresql://user:password@db:5432/zombiezone"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://zombiezone.kadath.fr
JWT_ACCESS_SECRET=<SECRET-FORT>
JWT_REFRESH_SECRET=<SECRET-FORT>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=warn
```

⚠️ Secrets JWT **obligatoires** — le serveur throw au démarrage si absent en production.

---

## Fichiers manquants à créer (TODO)

- `docker-compose.prod.yml`
- `Dockerfile` backend
- `Dockerfile` frontend (Nginx)
- Config Nginx (routing `/api` → backend, `/` → frontend, SSL)

→ Voir `DEPLOY.md` pour le détail.
