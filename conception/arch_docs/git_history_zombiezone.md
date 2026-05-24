# Historique des Commandes Git - Projet ZombieZone

Ce document récapitule les étapes de nettoyage, de fusion et d'optimisation effectuées sur le dépôt pour consolider le projet et aligner les différents remotes.

## 1. État des lieux et Navigation
| Commande | Action | Raison |
| :--- | :--- | :--- |
| `git branch --sort=-committerdate -v` | Liste les branches par date de dernier commit. | Identifier les branches actives et les derniers travaux effectués. |
| `git checkout master` | Bascule sur la branche principale. | Se préparer à fusionner les travaux des branches de fonctionnalités. |

## 2. Fusion et Consolidation (Merge)
| Commande | Action | Raison |
| :--- | :--- | :--- |
| `git merge feature/add-controllers+zod` | Fusionne la branche Zod dans master. | Intégrer la logique de validation et les contrôleurs backend. |
| `git merge vite-frontend-init` | Fusionne l'initialisation du frontend. | Intégrer la nouvelle structure React/Vite au projet global. |

## 3. Synchronisation avec les Remotes
| Commande | Action | Raison |
| :--- | :--- | :--- |
| `git remote -v` | Affiche les URLs des dépôts distants. | Vérifier la configuration de `origin` (perso) et `oclock` (école). |
| `git push origin master --force` | Pousse le master local vers le GitHub perso en écrasant l'historique distant. | Aligner le repo distant vide (ou avec un README différent) sur le travail local complet. |
| `git push oclock master` | Pousse le travail sur le dépôt de l'école. | Livrer la version finale du projet sur le serveur de la formation. |

## 4. Nettoyage des Branches Locales et Distantes
| Commande | Action | Raison |
| :--- | :--- | :--- |
| `git branch -d <nom_branche>` | Supprime une branche locale fusionnée. | Garder un terminal propre et éviter de travailler sur des branches obsolètes. |
| `git push origin --delete <nom_branche>` | Supprime la branche sur le serveur `origin`. | Nettoyer l'interface web de ton GitHub personnel. |
| `git branch -dr <remote>/<branche>` | Supprime la référence locale d'une branche distante. | Retirer les "branches fantômes" de la liste `git branch -a` sans toucher au serveur. |
| `git remote prune oclock` | Élage les branches de suivi locales pour `oclock`. | Synchroniser la liste des branches avec l'état réel du serveur de l'école. |

## 5. Maintenance et Optimisation
| Commande | Action | Raison |
| :--- | :--- | :--- |
| `git fsck` | Vérifie l'intégrité du système de fichiers Git. | Identifier les "dangling blobs" (objets orphelins) après les suppressions. |
| `git gc --prune=now --aggressive` | Lance le Garbage Collector de manière agressive. | Compresser la base de données, optimiser les performances et supprimer physiquement les objets inutilisés. |
| `git branch -a` | Liste toutes les branches (locales et distantes). | Vérifier visuellement que le nettoyage est complet et qu'il ne reste que le `master`. |

## Concepts Clés Appris
- **Pointeurs** : Git manipule des étiquettes mobiles (branches) pointant vers des instantanés (commits).
- **HEAD** : Le pointeur "Vous êtes ici" qui indique la position actuelle.
- **Pruning** : L'action d'élaguer les branches mortes ou les objets orphelins.
