
# 💡 Petit récap Docker Compose

## 🚀 Gérer des services

`docker-compose` permet de **définir et gérer plusieurs conteneurs** à l’aide d’un fichier `docker-compose.yml`.

> Ce fichier est au cœur de la configuration et permet de décrire l’ensemble de vos services.

---

## 🔗 Réseaux automatiques

Docker Compose crée **automatiquement un réseau** entre tous les services définis.

> Par exemple, si vous avez une base de données sur un service nommé `db`, vous pourrez y accéder depuis un autre conteneur via `db:5432`.

---

## 📦 Définition des volumes, ports, etc.

Voici un exemple de service PostgreSQL configuré :

```yaml
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: mypass
    volumes:
      - db-data:/var/lib/postgresql/data
```

---

## 🧱 Structure de base

```yaml
services:
  mon-service:
    image: mon-image:tag
    build: ./dossier
    ports:
      - "3000:3000"
    environment:
      - ENV_VAR=valeur
    volumes:
      - ./data:/app/data
    depends_on:
      - autre-service
```

---

## 🔍 Détail des paramètres

- **`image`** : utilise une image existante (locale ou depuis Docker Hub)
- **`build`** : construit une image à partir d’un `Dockerfile` (on peut préciser le contexte et le fichier)

```yaml
build:
  context: ./backend
  dockerfile: Dockerfile.dev
```

- **`ports`** : expose un port du conteneur vers l’hôte

```yaml
ports:
  - "3000:3000"
```

- **`environment`** : définit des variables d’environnement

```yaml
environment:
  - NODE_ENV=production
  - DB_PASS=supersecret
```

- **`volumes`** : monte un dossier ou un volume Docker

```yaml
volumes:
  - ./code:/app
  - db-data:/var/lib/postgresql/data
```

> `./code/` → chemin local sur la machine  
> `/app` → chemin dans le conteneur

- **`depends_on`** : déclare une dépendance à un autre service (ne gère *pas* l’attente du démarrage complet)

- **`command` / `entrypoint`** : permet de surcharger la commande par défaut

```yaml
command: npm run dev

entrypoint: ["sh", "-c", "echo hello && npm start"]
```

---

## 📚 Pour aller plus loin

- 📄 [Documentation officielle Docker Compose](https://docs.docker.com/compose/)
- 📄 [Référence complète du fichier Compose](https://docs.docker.com/compose/compose-file/)

---

