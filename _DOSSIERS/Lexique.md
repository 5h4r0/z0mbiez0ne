# Tableau du lexique

## Segment "Développeur Web Front End"

> 💡 Si tu vises uniquement la CCP 1 du TP DWWM, tu peux te contenter des tableaux de cette rubrique (même si, évidemment, plus tu en sais même sur les autres compétences, mieux c'est !)

### BONNES PRATIQUES

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Gestion de version** | Système (comme Git) qui enregistre les modifications apportées à un ensemble de fichiers au fil du temps. Il permet de collaborer, de revenir en arrière et de conserver un historique du code. |
| **Tests automatisés** | Procédure consistant à utiliser des outils logiciels pour exécuter automatiquement des tests sur le code (tests unitaires, d'intégration, d'interface) afin de vérifier qu'il fonctionne comme prévu et éviter les régressions. |

### CONNAISSANCES DE BASE

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Front-end vs Back-end** | Le **Front-end** désigne la partie visible et interactive d'une application (HTML/CSS/JS côté client). Le **Back-end** désigne la partie logique, invisible pour l'utilisateur (serveur, base de données, API). |
| **Back-office** | Interface d'administration d'un site ou d'une application, réservée aux gestionnaires (non accessible au grand public) pour gérer les contenus, les utilisateurs ou les commandes. |
| **IDE** | *Integrated Development Environment* (Environnement de développement intégré). Logiciel tout-en-un pour coder (ex: VS Code, WebStorm) qui regroupe un éditeur de texte, un terminal, un débogueur et des outils d'automatisation. |
| **CMS vs Frameworks vs Libraries** | Un **CMS** (ex: WordPress) est un site clé en main prêt à être configuré. Une **Library** (ex: React) est un ensemble de fonctions réutilisables que le développeur appelle quand il veut. Un **Framework** (ex: Angular, Symfony) impose un cadre de travail, une structure et dicte l'architecture de l'application. |
| **Dépendance** | Bibliothèque ou package externe dont un projet a besoin pour fonctionner correctement (ex: une dépendance installée via npm ou Composer). |
| **Token** | Jeton numérique (souvent une chaîne de caractères chiffrée comme un JWT) servant à identifier un utilisateur ou à sécuriser des échanges de données entre un client et un serveur après authentification. |
| **Types de données** | Classification de la nature d'une information en programmation. Les types de base incluent les chaînes de caractères (*String*), les nombres (*Number/Integer/Float*), les booléens (*Boolean*), les tableaux (*Array*) et les objets (*Object*). |
| **Client vs Serveur** | Le **Client** est l'appareil ou le logiciel (ex: un navigateur web) qui formule une requête. Le **Serveur** est la machine distante qui reçoit la requête, la traite et renvoie la réponse correspondante. |
| **Absolu vs relatif** | En informatique, un chemin **absolu** indique l'adresse complète depuis la racine (ex: `https://site.com/images/logo.png` ou `/var/www/index.html`). Un chemin **relatif** dépend de la position actuelle du fichier (ex: `../images/logo.png`). |
| **Callback** | Fonction passée en argument d'une autre fonction, qui sera exécutée (rappelée) après la fin d'une tâche spécifique ou lors d'un événement. |
| **JSON** | *JavaScript Object Notation*. Format de données textuel, léger, structuré sous forme de clés/valeurs, universellement utilisé pour échanger des données entre applications. |
| **Fonction vs Méthode** | Une **Fonction** est un bloc de code autonome réutilisable. Une **Méthode** est une fonction qui est définie à l'intérieur d'un objet ou d'une classe et qui s'applique à cet objet. |
| **Variable vs Propriété** | Une **Variable** est un espace de stockage nommé pour une donnée au sein d'un script. Une **Propriété** est une variable associée à un objet spécifique (une caractéristique de cet objet). |
| **Variable vs Constante** | Une **Variable** (ex: `let`) voit sa valeur pouvoir changer au cours de l'exécution du programme. Une **Constante** (ex: `const`) reçoit une valeur définitive lors de son initialisation qui ne peut plus être modifiée. |
| **Handler** | (Gestionnaire d'événement). Fonction ou bloc de code déclenché spécifiquement en réponse à une action précise (ex: un clic de souris, la soumission d'un formulaire). |
| **Abstraction** | Principe consistant à masquer les détails de mise en œuvre complexes d'un code pour ne proposer qu'une interface simple d'utilisation (on sait *ce que fait* l'outil, pas *comment* il le fait). |
| **Scope / Portée** | Zone d'un programme dans laquelle une variable est accessible et peut être lue ou modifiée (ex: portée globale, portée locale/de bloc). |
| **Itération** | Action de répétecer un processus ou un bloc d'instructions un certain nombre de fois, généralement au sein d'une boucle (ex: parcourir les éléments d'un tableau). |
| **Affectation** | Opération qui consiste à attribuer une valeur à une variable (généralement symbolisée par l'opérateur `=`). |

### FRONT

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Interface utilisateur web dynamique vs statique** | Une interface **statique** affiche le même contenu figé (HTML/CSS) pour tous les utilisateurs. Une interface **dynamique** modifie son affichage en temps réel sans recharger la page (via JavaScript) ou selon les données issues d'une base de données (via PHP/Node). |
| **Préprocesseur** | Outil (ex: Sass ou Less pour le CSS) qui permet d'écrire du code avec une syntaxe plus avancée (variables, fonctions, imbrications) avant de le compiler en code standard lisible par le navigateur. |
| **Accessibilité** | (a11y). Pratique consistant à concevoir des sites web utilisables par tous, y compris les personnes en situation de handicap, en respectant des normes d'intégration (balises sémantiques, contrastes, attributs ARIA). |
| **DOM** | *Document Object Model*. Représentation en arbre structuré d'une page web générée par le navigateur, que le JavaScript peut manipuler pour modifier dynamiquement le contenu, les styles ou la structure. |
| **Media Queries** | Fonctionnalité CSS permettant d'appliquer des règles de style différentes en fonction des caractéristiques de l'appareil (principalement la largeur de l'écran). |
| **Responsive** | Technique de conception web (Design réactif) qui permet à un site de s'adapter automatiquement et de façon fluide à toutes les résolutions d'écran (mobiles, tablettes, ordinateurs). |
| **Évènement** | Action ou occurrence détectée par le navigateur (ex: un clic, le survol d'un élément, l'appui sur une touche, le chargement de la page) sur laquelle le développeur peut brancher du code. |

### REQUÊTE

| Terme technique  | Définition & différence si besoin |
| - | - |
| **XHR** | *XMLHttpRequest*. Objet JavaScript natif utilisé historiquement pour effectuer des requêtes HTTP asynchrones vers un serveur sans recharger la page (aujourd'hui souvent remplacé par l'API `fetch`). |
| **Requête HTTP** | Message envoyé par un client à un serveur web pour demander une ressource (une page HTML, une image, des données JSON) ou soumettre des informations. |
| **Paramètres vs Arguments** | Les **Paramètres** sont les variables listées dans la déclaration d'une fonction. Les **Arguments** sont les valeurs réelles transmises à la fonction lorsqu'elle est appelée. |
| **Paramètres d'URL** | Informations ajoutées à la fin d'une URL (souvent après un `?` sous forme de clé=valeur) pour transmettre des critères à une page ou à une API (ex: `?search=ordinateur&page=2`). |
| **GET vs POST** | **GET** est une méthode HTTP utilisée pour *récupérer* des données (les données passent par l'URL). **POST** est utilisé pour *envoyer* ou créer des données (les données sont masquées dans le corps de la requête). |
| **Corps de la requête** | (Request Body). Zone d'une requête HTTP (utilisée avec POST, PUT) contenant les données lourdes ou sensibles envoyées au serveur (ex: le contenu d'un formulaire, un fichier JSON). |
| **Headers** | (En-têtes HTTP). Informations d'accompagnement envoyées avec une requête ou une réponse, fournissant des métadonnées sur le message (ex: le type de contenu `Content-Type`, les jetons d'authentification). |
| **AJAX** | *Asynchronous JavaScript And XML*. Approche de développement combinant JavaScript et requêtes HTTP pour échanger des données avec un serveur et mettre à jour le contenu d'une page de manière asynchrone, sans rechargement global. |

### SÉCURITÉ

| Terme technique  | Définition & différence si besoin |
| - | - |
| **OWASP** | *Open Web Application Security Project*. Communauté internationale qui répertorie et publie régulièrement le classement des failles de sécurité web les plus critiques (Top 10 OWASP) et fournit des conseils pour s'en prémunir. |

### SEO

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Référencement organique vs payant** | Le référencement **organique** (SEO) est le classement naturel d'un site dans les moteurs de recherche obtenu grâce à la qualité du contenu et de la technique. Le référencement **payant** (SEA) consiste à acheter des espaces publicitaires (ex: Google Ads) pour apparaître en tête des résultats. |

## Segment "Développeur Web Back End"

> 💡 Si tu vises uniquement la CCP 2 du TP DWWM, nous te conseillons malgré tout de regarder les notions contenues dans la rubrique "Développeur Web Front End"  

### ARCHITECTURE

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Design pattern** | (Patron de conception). Solution standardisée, éprouvée et réutilisable face à un problème d'architecture ou de conception logicielle récurrent. |
| **MVC** | *Modèle-Vue-Contrôleur*. Pattern d'architecture logicielle séparant l'application en 3 composants : le **Modèle** (gestion des données), la **Vue** (l'interface utilisateur) et le **Contrôleur** (la logique métier faisant le lien entre les deux). |
| **Architecture** | Structure générale d'un système informatique, définissant la manière dont les composants logiciels et matériels sont organisés, agencés et communiquent entre eux. |

### BACK

| Terme technique  | Définition & différence si besoin |
| - | - |
| **API** | *Application Programming Interface*. Interface logicielle permettant à deux applications distinctes de communiquer, d'échanger des données et des services entre elles de manière automatisée. |
| **REST** | Style d'architecture pour la conception d'API web basé sur le protocole HTTP, utilisant ses méthodes standards (GET, POST, PUT, DELETE) et des URL claires pour manipuler des ressources. |
| **CRUD** | Acronyme pour *Create, Read, Update, Delete*. Représente les quatre opérations fondamentales de gestion des données en base de données ou dans une application. |
| **ORM** | *Object-Relational Mapping*. Outil/bibliothèque (ex: Doctrine en PHP, Sequelize en JS) permettant de manipuler les lignes d'une base de données relationnelle sous forme d'objets manipulables dans le code de programmation. |

### BASE DE DONNÉES

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Clés primaires vs Clés étrangères** | La **Clé primaire** identifie de manière unique et obligatoire chaque enregistrement d'une table. La **Clé étrangère** est un champ d'une table qui pointe vers la clé primaire d'une autre table, établissant ainsi une relation entre elles. |
| **SGBD** | *Système de Gestion de Base de Données*. Logiciel permettant de stocker, structurer, modifier et interroger des bases de données (ex: MySQL, PostgreSQL, MongoDB). |

### POO

| Terme technique  | Définition & différence si besoin |
| - | - |
| **POO** | *Programmation Orientée Objet*. Paradigme de programmation basé sur le concept d'objets, qui regroupent des caractéristiques (propriétés) et des comportements (méthodes). |
| **Classe** | Moule, modèle ou plan de fabrication qui définit la structure et les comportements des futurs objets qui seront créés à partir d'elle (instanciés). |
| **Héritage** | Mécanisme en POO permettant à une classe (classe fille) de récupérer automatiquement l'ensemble des propriétés et méthodes d'une autre classe (classe mère), favorisant la réutilisation du code. |

## Segment "Expert Javacript"

> 💡 Si tu vises un TP DWWM, tu n'es pas obligé de te pencher sur les tableaux de cette rubrique (mais là encore, ça peut être un plus devant un jury)

### MÉTHODOLOGIE

| Terme technique  | Définition & différence si besoin |
| - | - |
| **SCRUM** | Cadre de travail (Framework) agile le plus utilisé pour la gestion de projets. Il privilégie le développement incrémental à travers des cycles de travail courts appelés "Sprints" (généralement de 2 à 4 semaines). |

### SYSTÈME & MISE EN LIGNE

| Terme technique  | Définition & différence si besoin |
| - | - |
| **Server : machine vs logiciel** | Le serveur **machine** (hardware) est l'ordinateur physique connecté à internet qui stocke les fichiers. Le serveur **logiciel** (software) est le programme (ex: Apache, Nginx) installé sur cette machine pour intercepter et traiter les requêtes web. |
| **Déploiement** | Processus consistant à transférer le code d'une application informatique depuis l'environnement de développement local vers un serveur de production afin de la rendre accessible aux utilisateurs finaux. |
| **LAMP/WAMP/MAMP** | Environnements techniques de développement locaux regroupant : un système d'exploitation (**L**inux/**W**indows/**M**ac), le serveur web **A**pache, la base de données **M**ySQL et le langage de script **P**HP. |
| **Recette** | Phase de test finale menée par les équipes de développement, les clients ou des testeurs dédiés pour valider la conformité de l'application par rapport au cahier des charges avant sa mise en ligne. |
| **Préproduction** | Environnement d'hébergement serveur identique en tout point à la production, utilisé pour effectuer les derniers tests en conditions réelles sans impact sur les utilisateurs finaux. |