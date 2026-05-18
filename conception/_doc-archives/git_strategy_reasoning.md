# Architecture et Stratégie Git : Le Cas ZombieZone

Ce document détaille la logique décisionnelle appliquée lors de la phase de consolidation du projet. L'objectif est d'expliquer le "pourquoi" derrière les manipulations techniques pour garantir la pérennité et la clarté du code.

---

## 1. Définition de la "Source de Vérité" (Source of Truth)

**Décision :** Centralisation absolue sur la branche `master`.

**Raisonnement :** En fin de cycle de développement, la multiplication des branches (`Vite`, `Zod`, `JWT`) fragmente la vision globale du projet. Fusionner ces branches dans `master` permet de créer un état stable, testable et livrable. Cela réduit la charge mentale en éliminant les allers-retours entre contextes techniques différents et définit un point d'entrée unique pour tout futur déploiement.

## 2. Logique de Gestion des Remotes (Autorité vs Bac à sable)

**Décision :** Utilisation du `--force` sur `origin` (personnel) mais synchronisation classique sur `oclock` (formation).

**Raisonnement :**
* **`origin` (Dépôt Souverain) :** Ce dépôt sert de vitrine personnelle. Si l'historique local est jugé plus pertinent ou plus "propre" que l'historique distant (cas d'un README divergent ou d'un historique initial vide), la réécriture de l'historique distant via un `push --force` est une décision architecturale assumée pour maintenir une vitrine de haute qualité.
* **`oclock` (Dépôt de Référence/Rendu) :** Ici, le respect de l'historique est primordial. On privilégie la synchronisation additive pour maintenir une traçabilité sans rupture, respectant ainsi les conventions de travail collaboratif.

## 3. Cycle de Vie des Branches de Fonctionnalités (Feature Branches)

**Décision :** Suppression systématique après fusion (Local & Remote Tracking).

**Raisonnement :** Une branche de fonctionnalité est un outil temporaire de développement, pas une archive permanente. Une fois le code fusionné, maintenir le pointeur de branche crée de la pollution visuelle dans les outils de diagnostic (`git branch`). La suppression locale et l'élagage des références distantes (`pruning`) obligent à maintenir un environnement de travail "Lean", où chaque élément affiché possède une valeur opérationnelle immédiate.

## 4. Optimisation de la Base de Données d'Objets

**Décision :** Maintenance agressive via `git gc --aggressive`.

**Raisonnement :** Git fonctionne par accumulation de snapshots. Les opérations de fusion et de suppression de branches laissent des "objets orphelins" qui alourdissent le dossier `.git`. Le raisonnement ici est celui de l'efficacité systémique : en forçant la compression et l'élagage physique (`prune`), on transforme un dépôt fragmenté en une structure compacte, optimisant ainsi les temps de réponse des futures commandes et l'espace disque.

## 5. Gestion des Pointeurs et de la Visibilité

**Décision :** Nettoyage manuel des références distantes (`git branch -dr`).

**Raisonnement :** La vision locale des dépôts distants doit être un reflet fidèle et utile de la réalité. Garder des références vers des branches obsolètes sur le serveur crée une asymétrie d'information. En nettoyant ces pointeurs, on s'assure que les outils de diagnostic (`git branch -a`) ne fournissent que des informations actionnables, évitant ainsi les erreurs de déploiement ou de checkout sur des versions périmées.

---

*Ce document sert de référence pour comprendre la rigueur appliquée à la gestion de configuration du projet ZombieZone.*
