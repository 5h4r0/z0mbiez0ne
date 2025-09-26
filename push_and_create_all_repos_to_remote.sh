#!/bin/bash

# Script pour pousser toutes les branches des dépôts locaux vers leurs remotes upstream ou en créer de nouveaux si nécessaire

# Définir le chemin du dossier parent contenant les projets
parent_folder="/var/www/html"

# Définir les codes de couleur ANSI
RED="\033[31m"
GREEN="\033[32m"
RESET="\033[0m"

# Vérifier si le dossier existe
if [ ! -d "$parent_folder" ]; then
    echo -e "${RED}❌ Le dossier $parent_folder n'existe pas.${RESET}"
    exit 1
fi

# Parcourir chaque sous-dossier dans le dossier parent
for dir in "$parent_folder"/*/ ; do
    # Vérifier si le dossier existe et est un répertoire
    if [ -d "$dir" ]; then
        # Extraire le nom du dossier
        folder_name=$(basename "$dir")
        echo "
        *** Traitement du dossier : $folder_name"
        
        # Entrer dans le dossier du projet
        cd "$dir" || continue
        
        # Vérifier si le dossier est un dépôt Git
        if [ -d ".git" ]; then
            # Vérifier si un remote upstream est configuré
            if git remote -v | grep -q "upstream.*5h4r0/$folder_name"; then
                echo "  - Remote upstream déjà configuré pour $folder_name : $(git remote get-url upstream)"
                # Tester si le remote upstream est accessible
                if git ls-remote upstream >/dev/null 2>&1; then
                    echo "  - Remote upstream accessible, tentative de push..."
                    # Récupérer toutes les branches locales
                    branches=$(git branch --format='%(refname:short)')
                    if [ -z "$branches" ]; then
                        echo -e "
                        ${RED}/!\ Aucune branche trouvée pour $folder_name${RESET}
                        "
                        cd "$parent_folder" || exit 1
                        continue
                    fi
                    # Pousser chaque branche vers le remote upstream
                    for branch in $branches; do
                        echo "* Push de la branche $branch pour $folder_name"
                        if git push upstream "$branch" 2>&1 | tee /tmp/git-push-error.log; then
                            echo -e "${GREEN}✅ Branche $branch pushed avec succès pour $folder_name${RESET}"
                        else
                            echo -e "
                            ${RED}❌ Échec du push pour la branche $branch de $folder_name
                            Détails de l'erreur :${RESET}"
                            cat /tmp/git-push-error.log
                            echo -e "
                            "
                        fi
                    done
                else
                    echo -e "  - Remote upstream non accessible, suppression et création d'un nouveau dépôt..."
                    # Supprimer le remote upstream existant
                    git remote remove upstream
                    # Créer un nouveau dépôt sur le compte 5h4r0
                    if gh repo create "5h4r0/$folder_name" --public --source=. --push 2>&1 | tee /tmp/gh-error.log; then
                        echo -e "${GREEN}  ✅ Nouveau dépôt créé pour $folder_name${RESET}"
                        # Configurer le remote upstream
                        git remote add upstream git@github.com:5h4r0/$folder_name.git
                        # Pousser toutes les branches locales après la création
                        branches=$(git branch --format='%(refname:short)')
                        for branch in $branches; do
                            echo "=> Pousser la branche $branch pour $folder_name"
                            if git push upstream "$branch" 2>&1 | tee /tmp/git-push-error.log; then
                                echo -e "${GREEN}  ✅ Branche $branch poussée avec succès pour $folder_name${RESET}"
                            else
                                echo -e "
                                ${RED}❌ Échec du push pour la branche $branch de $folder_name
                                Détails de l'erreur :${RESET}"
                                cat /tmp/git-push-error.log
                                echo -e "
                                "
                            fi
                        done
                    else
                        echo -e "${RED}**
                        ❌ Échec de la création du dépôt pour $folder_name
                        Détails de l'erreur :${RESET}"
                        cat /tmp/gh-error.log
                        echo -e "
                        "
                    fi
                fi
            else
                echo -e "
                ${GREEN}# Aucun remote upstream configuré pour $folder_name ou configuration incorrecte. Création d'un nouveau dépôt...${RESET}"
                # Supprimer un éventuel upstream incorrect
                if git remote -v | grep -q "upstream"; then
                    git remote remove upstream
                fi
                # Créer un dépôt GitHub sur le compte 5h4r0 et pousser toutes les branches
                if gh repo create "5h4r0/$folder_name" --public --source=. --push 2>&1 | tee /tmp/gh-error.log; then
                    echo -e "${GREEN}  ✅ Nouveau dépôt créé pour $folder_name${RESET}"
                    # Configurer le remote upstream
                    git remote add upstream git@github.com:5h4r0/$folder_name.git
                    # Pousser toutes les branches locales après la création
                    branches=$(git branch --format='%(refname:short)')
                    for branch in $branches; do
                        echo "=> Pousser la branche $branch pour $folder_name"
                        if git push upstream "$branch" 2>&1 | tee /tmp/git-push-error.log; then
                            echo -e "${GREEN}  ✅ Branche $branch poussée avec succès pour $folder_name${RESET}"
                        else
                            echo -e "
                            ${RED}❌ Échec du push pour la branche $branch de $folder_name
                            Détails de l'erreur :${RESET}"
                            cat /tmp/git-push-error.log
                            echo -e "
                            "
                        fi
                    done
                else
                    echo -e "${RED}**
                    ❌ Échec de la création du dépôt pour $folder_name
                    Détails de l'erreur :${RESET}"
                    cat /tmp/gh-error.log
                    echo -e "
                    "
                fi
            fi
        else
            echo -e "
            ${RED}/!\ Le dossier $folder_name n'est pas un dépôt Git. Ignoré.${RESET}
            "
        fi
        
        # Revenir au dossier parent
        cd "$parent_folder" || exit 1
    fi
done

echo -e "
${GREEN}/!\ Traitement terminé pour tous les repos.${RESET}"

# Afficher la liste des dépôts GitHub pour le compte 5h4r0
echo -e "
${GREEN}📜 Liste des dépôts GitHub pour 5h4r0:${RESET}"
gh repo list 5h4r0 --limit 100