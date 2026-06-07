# Ajout des headers de sécurité HTTP dans nginx.conf

## Fichier à modifier

`docker/nginx.conf`

## Modification à apporter

Dans le bloc `server` qui écoute sur le port 443, ajouter les headers de sécurité HTTP juste après la directive `ssl_certificate_key`, avant le bloc `gzip` :

```nginx
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Résultat attendu dans le fichier

```nginx
server {
    listen 80;
    server_name sharo.fr;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name sharo.fr;

    ssl_certificate /etc/letsencrypt/live/sharo.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sharo.fr/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    ...
```

## Commit

```
fix(nginx): add HTTP security headers
```

## Déploiement sur le VPS

Après merge sur master et déploiement automatique CI/CD, vérifier que Nginx a bien rechargé :

```bash
ssh steph@82.165.180.54
docker compose -f docker-compose.prod.yaml exec frontend nginx -t
```

Si `nginx -t` retourne `syntax is ok` et `test is successful` → tout va bien.

Si erreur → retirer les 4 lignes et redéployer.

## Vérification

```bash
curl -I https://sharo.fr
```

Doit afficher dans les headers de réponse :
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
