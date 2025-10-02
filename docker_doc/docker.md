# Docker

## Introduction à Docker

### ✅ Qu’est-ce que Docker ?

Docker est un outil de **conteneurisation**. Il permet d’**emballer une application** (ex. une API Node.js) **avec tout ce qu’il lui faut pour fonctionner** (Node.js, dépendances npm, base de données, etc.) dans ce qu’on appelle un **conteneur**.

Mais avant d’avoir un conteneur, il y a d’abord une **image Docker**.

---

### 🧱 Image vs Conteneur – Quelle différence ?

| Image Docker              | Conteneur Docker              |
| ------------------------- | ----------------------------- |
| Une **recette figée**     | Une **instance qui tourne**   |
| Comme un **template**     | Comme un **objet vivant**     |
| Ne change pas             | Peut lire/écrire des données  |
| Ex : une image de Node.js | Ex : un serveur Node.js actif |

#### 🧁 Métaphore

> Une **image**, c’est une recette de gâteau.
> Un **conteneur**, c’est le gâteau préparé selon la recette.
> Tu peux lancer plusieurs gâteaux (conteneurs) à partir d’une seule recette (image).

---

### ❓Pourquoi utiliser Docker ?

#### 1. **“Chez moi ça marche…”**

> Ton projet fonctionne sur ton ordi, mais pas sur celui de ton collègue ou sur le serveur ?

👉 **Problème** : différences d’environnement (version de Node, OS, dépendances…).

✅ **Avec Docker** : tu crées un conteneur avec exactement les versions et fichiers qu’il faut → **même environnement partout**.

---

#### 2. **Installation rapide & reproductible**

Sans Docker :

- Installer manuellement Node, PostgreSQL, Redis…
- Configurer chaque outil à la main

Avec Docker :

```bash
docker compose up
```

Tout est prêt en une commande ✨
Pratique pour **onboarder rapidement** un nouveau développeur.

---

#### 3. **Isolation entre projets**

Docker isole chaque projet dans son propre conteneur :

- Tu peux avoir un projet en Node 16 et un autre en Node 20 en même temps.
- Aucun conflit entre bases de données ou ports.

---

### 📦 Cas concrets pour un dev JS/TS

- Lancer une API Node.js dans un conteneur
- Ajouter une base PostgreSQL sans l’installer en local
- Travailler en équipe avec le même environnement
- Tester ton app dans un contexte proche de la prod

---

### 🛠️ Ce que Docker n’est pas

- ❌ Ce **n’est pas une machine virtuelle complète** : c’est beaucoup plus léger.
- ❌ Ce **n’est pas un hébergeur**, mais c’est souvent utilisé en prod (avec Kubernetes ou autres).
- ❌ Ce **n’est pas un langage**, mais un outil qui accompagne ton stack (JS/TS dans notre cas).

---

### 📌 Résumé

| Problème courant                  | Docker permet…                       |
| --------------------------------- | ------------------------------------ |
| “Chez moi ça marche pas”          | Un environnement identique pour tous |
| Installations manuelles pénibles  | Tout en une commande                 |
| Conflits entre projets (Node, DB) | Isolation entre les conteneurs       |

Parfait ! Voici la **Fiche 2**, qui explique comment créer une image Docker à partir d’un `Dockerfile` et en lancer un conteneur, avec des exemples clairs pour un projet Node.js/TypeScript.

---

## 🐳 Créer un conteneur à partir d’un Dockerfile

### 📁 Exemple de projet Node.js/TypeScript

Imaginons que tu as une API avec cette structure :

```
mon-projet/
├── src/
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

### 📄 Étape 1 – Créer un `Dockerfile`

```dockerfile
# Utilise une image officielle Node.js comme base
FROM node:20

# Crée un dossier dans le conteneur
WORKDIR /app

# Copie les fichiers de l’hôte vers le conteneur
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste des fichiers (ex : src/)
COPY . .

# Compile TypeScript (optionnel selon ton setup)
RUN npm run build

# Expose le port (ex : 3000)
EXPOSE 3000

# Commande pour démarrer l'app
CMD ["npm", "start"]
```

---

### 🧱 Étape 2 – Construire une **image** Docker

```bash
docker build -t mon-api .
```

- `build` : construit une image
- `-t mon-api` : donne un nom à l’image (`mon-api`)
- `.` : utilise le `Dockerfile` dans le dossier courant

---

### ▶️ Étape 3 – Lancer un **conteneur**

```bash
docker run -p 3000:3000 mon-api
```

- `-p 3000:3000` : redirige le port **du conteneur** vers ton hôte
- `mon-api` : nom de l’image

Maintenant, ton app est dispo sur `http://localhost:3000`

---

### 🛠️ Commandes utiles

| Commande                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `docker images`             | Liste les images présentes                   |
| `docker ps`                 | Liste les conteneurs en cours                |
| `docker ps -a`              | Liste **tous** les conteneurs (même arrêtés) |
| `docker stop <id>`          | Stoppe un conteneur en cours                 |
| `docker rm <id>`            | Supprime un conteneur                        |
| `docker rmi <image>`        | Supprime une image                           |
| `docker exec -it <id> bash` | Ouvre un terminal dans un conteneur          |

---

### 🚀 Astuce dev : reconstruire et relancer rapidement

Si tu modifies ton code ou le `Dockerfile`, il faut :

```bash
docker build -t mon-api .    # reconstruit l'image
docker run -p 3000:3000 mon-api
```

---

### 📌 Résumé

| Étape                 | Commande                          |
| --------------------- | --------------------------------- |
| Créer une image       | `docker build -t mon-api .`       |
| Lancer un conteneur   | `docker run -p 3000:3000 mon-api` |
| Lister les conteneurs | `docker ps` ou `docker ps -a`     |

Tu as raison Ben, merci pour ta franchise 👍
La partie sur les volumes était trop superficielle et manquait d'exemples concrets utiles aux développeurs. Voici une **nouvelle version complète et réécrite de la Fiche 3**, avec une **explication claire des volumes**, **des montages de dossiers locaux**, et une meilleure pédagogie dans l’ensemble.

---

## 🐳 Gérer plusieurs services avec Docker Compose

## 📁 Exemple de structure d’un projet Node.js + PostgreSQL

```
mon-projet/
├── src/
│   └── index.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── .env
```

---

### 🔧 Fichier `.env`

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=supersecret
DB_NAME=ma_base
```

Ces variables seront utilisées par `docker compose` pour :

- paramétrer les conteneurs (ports, credentials…)
- **ne pas hardcoder** les secrets ou infos d’environnement

---

### 🐳 Fichier `docker-compose.yml` (explication + exemple)

```yaml
version: "3.9"

services:
  api:
    build: .
    container_name: mon-api
    ports:
      - "${PORT}:3000"
    environment:
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
    volumes:
      - ./src:/app/src # Montre le code local dans le conteneur
      - /app/node_modules # Empêche node_modules d’être écrasé
    depends_on:
      - db
    networks:
      - mon-reseau

  db:
    image: postgres:15
    container_name: postgres-db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - db-data:/var/lib/postgresql/data # Volume nommé = données persistées
    networks:
      - mon-reseau

volumes:
  db-data: # Volume Docker persistant pour PostgreSQL

networks:
  mon-reseau: # Réseau privé entre les services
```

---

### 🔍 Zoom sur les **volumes**

#### 🔁 1. Monter un **dossier local dans un conteneur**

```yaml
volumes:
  - ./src:/app/src
```

- À gauche : `./src` = le dossier local (sur ta machine)
- À droite : `/app/src` = le dossier dans le conteneur
- 🧠 → Quand tu modifies tes fichiers locaux, c’est visible **directement dans le conteneur** !

Très utile en développement pour **hot reload**, **debug**…

---

#### 💾 2. Créer un **volume persistant** pour les données

```yaml
volumes:
  - db-data:/var/lib/postgresql/data
```

- Le dossier `/var/lib/postgresql/data` contient les **données de ta base**
- Grâce au volume `db-data`, elles **ne sont pas perdues** si tu supprimes le conteneur

Déclaration plus bas :

```yaml
volumes:
  db-data:
```

Docker gère tout automatiquement.

---

### 🌐 Zoom sur le réseau

```yaml
networks:
  mon-reseau:
```

- Crée un réseau Docker **interne privé**
- Les services peuvent s'appeler par leur **nom** (`db`, `api`, etc.)
- Ex. : dans Node.js, la connexion PostgreSQL se fait sur `host: db`, `port: 5432`

---

### ▶️ Commandes `docker compose` à connaître

| Commande                        | Explication                                   |
| ------------------------------- | --------------------------------------------- |
| `docker compose up`             | Démarre tous les conteneurs                   |
| `docker compose up -d`          | Idem, en arrière-plan                         |
| `docker compose down`           | Stoppe et supprime tous les conteneurs        |
| `docker compose build`          | Reconstruit les images à partir du Dockerfile |
| `docker compose logs -f`        | Affiche les logs en temps réel                |
| `docker compose exec api bash`  | Ouvre un terminal dans le conteneur `api`     |
| `docker compose ps`             | Affiche l’état de tous les services           |
| `docker volume ls`              | Liste les volumes Docker                      |
| `docker volume inspect db-data` | Détaille le volume nommé `db-data`            |

---

### ✅ Résumé

| 🔧 Élément       | 🧠 Utilité                                  |
| ---------------- | ------------------------------------------- |
| `volumes:`       | Monter ton code local / stocker les données |
| `networks:`      | Permet aux services de se parler            |
| `.env`           | Centraliser les variables d’environnement   |
| `depends_on:`    | Démarrer les conteneurs dans le bon ordre   |
| `docker compose` | Commande moderne pour gérer tout facilement |

Excellent point Ben — on va **compléter la fiche 4** avec une section claire et détaillée sur **comment se connecter dans un conteneur avec un terminal interactif**. Voici la fiche mise à jour :

---

## 🐳 Debug & Inspection des conteneurs Docker en développement

### 🛠️ 1. Lire les logs des services

```bash
docker compose logs
docker compose logs -f api
```

- `-f` = _follow_ (équivalent de `tail -f`)
- Permet de suivre les erreurs, crashs, messages de debug, etc.

---

### 🖥️ 2. Ouvrir un **terminal interactif** dans un conteneur

#### ▶️ Commande :

```bash
docker compose exec api bash
```

- Lance un **shell bash** dans le conteneur nommé `api`
- Tu peux ensuite exécuter des commandes comme en local (`ls`, `npm install`, `node`, etc.)

#### 📌 Si `bash` n’est pas disponible :

```bash
docker compose exec api sh
```

- `sh` est plus basique, mais présent dans la majorité des images légères (comme Alpine)

#### 🧪 Exemple de session interactive :

```bash
$ docker compose exec api bash
root@123abc:/app# ls
src  package.json  node_modules
root@123abc:/app# node
> console.log("test")
```

#### ⚠️ Si tu veux **une pseudo-TTY + stdin actif**, utilise :

```bash
docker compose exec -it api bash
```

- `-i` = stdin actif (interactif)
- `-t` = pseudo-terminal (affichage propre)

> 🎯 Utile pour des REPLs (`node`, `psql`, etc.) ou pour exécuter un éditeur de texte (`nano`, `vi`…)

---

## 🔍 3. Inspecter les fichiers et l’environnement

```bash
ls -al /app
cat /app/src/index.ts
printenv
```

---

### 🔄 4. Rebuild à chaud

```bash
docker compose up --build
```

Reconstruit l’image en prenant en compte les modifications (utile si pas de montage de volume).

---

### 🧹 5. Réinitialiser l’environnement

```bash
docker compose down -v
```

- Supprime conteneurs + **volumes** associés
- ⚠️ Les données (ex: base PostgreSQL) sont perdues

---

### 🔧 6. Infos détaillées sur un conteneur

```bash
docker inspect mon-api
```

Ou pour extraire une info :

```bash
docker inspect -f '{{ .Config.Env }}' mon-api
```

---

### 📡 7. Tester un service depuis un conteneur

```bash
curl http://localhost:3000
curl http://db:5432
```

---

### 🐘 8. Explorer PostgreSQL dans le conteneur `db`

```bash
docker compose exec db psql -U $DB_USER $DB_NAME
```

---

### 📥 9. Copier des fichiers depuis/vers un conteneur

```bash
docker cp mon-api:/app/debug.js ./debug.js
docker cp ./patch.js mon-api:/app/patch.js
```

---

### ✅ Récapitulatif : commandes de debug utiles

| Commande                           | Utilité                               |
| ---------------------------------- | ------------------------------------- |
| `docker compose logs -f api`       | Lire les logs en temps réel           |
| `docker compose exec -it api bash` | Terminal interactif dans le conteneur |
| `docker compose exec db psql …`    | Requête directe dans PostgreSQL       |
| `docker compose up --build`        | Rebuild + restart                     |
| `docker compose down -v`           | Reset complet (conteneurs + volumes)  |
| `docker inspect mon-api`           | Détails d’un conteneur                |
| `docker cp …`                      | Copier vers ou depuis un conteneur    |
