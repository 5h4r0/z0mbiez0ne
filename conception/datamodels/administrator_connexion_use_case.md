# Use case

## Rôle : administrateur

### Connexion au back-office d'administration

| Action | Détail |
|--------|--------|
| Sign in / Connexion | L'administrateur se connecte de manière sécurisée au back-office de l'application afin d'administrer les activités vendues par la boutique ZombieLand, ainsi que les catégories d'activité, les sessions, les commandes, et les utilisateurs, ainsi que les pages de contenu légal, de contact, et de présentation du parc d'attraction et de l'entreprise. |

**Spécifications**

- Le formulaire propose les deux champs (identification et authentification) sur la même page.

- Les champs sont sécurisés déjà en front, puis filtrés en back côté serveur.

- Le champ identifiant *"Email address"* réclame l'adresse email enregistrée, le champ *"Password"* masque la frappe de celui-ci en affichant des astériques (comportement habituel de ce type de champ).

- À l'ouverture de la page, le focus de saisie est mis sur le champ *"Email address"*.

- Dans chaque champ est écrit en plus clair l'information requise : *"Email address"*, *"password"* (placeholder).

- Il est possible de naviguer d'un champ à l'autre un une action avec la touche [TAB], du champ Identifiant *"Email address"* au bouton *"Sign in"*.

- Si l'identifiant et le mot de passe sont stockés dans le navigateur, les 2 champs sont déjà remplis.

- L'administrateur doit ensuite : soit valider le formulaire de connexion avec la touche [ENTER], soit cliquer avec la souris sur le bouton *"Sign-in"* en fin de formulaire.

- En cas d'erreur de saisie de l'adresse email d'identification ou cas d'erreur de saisir du mot de passe, le texte *"Authentication failed. Please check your entry and try again."* s'affiche en rouge au-dessus du boutton *"Sign-in"*.

- Un lien sous le formulaire propose de changer le mot de passe, *"Click here to change your password (or if you have forgotten it)"*. Ce lien ouvre une fenêtre modale (popup - fenêtre contextuelle) contenant un formulaire sécurisé en front et back qui permet de saisir une adresse e-mail (champ avec placeholder *"Email address"*) et de valider avec un bouton *"Confirm your e-mail address"*.

- Si l'email n'est pas reconnu, s'affiche un message d'alerte "Unrecognized email address" sous le champ de saisie de l'email. Le focus reste sur ce champs de saisie. Le message d'alerte reste affiché jusqu'à resoumission du formulaire.

- Une fois le formulaire de changement de mot de passe validé, s'affiche à la place de celui-ci le message *"An email has been sent to you with a link to set a new password"*.

- En cas d'authentification réussie, le navigateur charge la route `/manage`, affichant le dashboard d'administration.

- L'admin pourra enregistrer son mot de passe après la proposition du navigateur, fonctionnalité de celui-ci qui ne sera pas désactivée.

#### Annexes
- Un "captcha" n'est pas utile.
- Les couleurs des messages d'alerte seront en rouge "crimson" - voir la charte graphique.

---

<!-- ### Création d'une activité -->
