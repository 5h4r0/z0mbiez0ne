# 📘 Modèle Conceptuel et Logique de Données (MCD & MLD)

Ce document décrit le modèle conceptuel (**MCD**) et le modèle logique (**MLD**) de données du projet.  
- Le **MCD** présente uniquement les entités et associations métier.  
- Le **MLD** ajoute les clés primaires/étrangères, les champs techniques et les règles de gestion (suppression, anonymisation).  

---

## 🧩 Modèle Conceptuel de Données (MCD)

### Entités

#### User
- UserCode  
- Role {member, admin} 
- Email  
- Firstname  
- Lastname  
- PasswordHash  
 
#### Role
- RoleCode
- Name  

#### Category
- CategoryCode  
- Title  
- Description  
- Image  

#### Activity
- ActivityCode  
- Title  
- Description  
- Price  
- Image  

#### ActivitySession
- SessionCode  
- SessionDate  
- Capacity  
- CapacityLeft  
- Status {Scheduled, Cancelled, Completed}  

#### Order
- OrderCode    
- TicketsQty 
- UnitPrice  

#### Cart
- CartCode  
- TotalPrice  
- Taxes  
- PaymentMethod  
- PaymentDate  
- Status {Pending, Confirmed, Cancelled, Refunded}  

---

### Associations & Cardinalités

APPARTENIR  
Activity (1,1) ---- (0,N) Category  
- Une **Activity** doit appartenir à une **Category**.  
- Une **Category** peut contenir zéro, une ou plusieurs **Activities** (catégorie vide autorisée).  

PLANIFIER  
Activity (0,N) ---- (1,1) ActivitySession  
- Une **Activity** peut avoir zéro ou plusieurs **ActivitySessions**.  
- Chaque **ActivitySession** est liée à une et une seule **Activity**.  

PASSER  
User (0,N) ---- (1,1) Cart  
- Un **User** peut passer zéro ou plusieurs commandes **Cart**.  
- Chaque **Cart** appartient à un seul **User**.  

POSSÈDE  
Cart (0,N) ---- (1,1) Order  
- Un **Cart** contient zéro ou plusieurs **Order**.  
- Chaque **Order** appartient à un seul **Cart**.  

CIBLER  
OrderLine (1,1) ---- (0,N) ActivitySession  
- Chaque **Order** cible une **ActivitySession**.  
- Une **ActivitySession** peut apparaître dans plusieurs **Order** (sur plusieurs utilisateurs).  

CARACTÉRISE
Role (0,N) --- (1,1) User
- Un **Role** caractérise zéro ou plusieurs **User**.
- Chaque **User** n'est caractérisé que par un seul **Role**.

---


## 🧩 Modèle Logique de Données (MLD)

### User
- UserId (PK)  
- RoleId (FK → Role.RoleId)  
- Email (UNIQUE)  
- Firstname  
- Lastname  
- PasswordHash  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** :  
- Si aucun Cart → User hard delete possible.  
- Si Cart Pending → User hard delete possible (delete User + Cart + Orders).  
- Si Cart Confirmed/Refunded → User soft delete possible + anonymisation obligatoire (garder historique).  
- Si Cart Cancelled → User soft delete possible (Carts conservés comme annulé).  

---

### Role
- RoleId (PK)
- Name {member, admin}

---

### Category
- CategoryId (PK)  
- Title  
- Description  
- Image  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Category soft delete autorisé, historique conservé.  

---

### Activity
- ActivityId (PK)  
- CategoryId (FK → Category.CategoryId)  
- Title  
- Description  
- Price  
- Image  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Activity soft delete autorisé, historique conservé.  

---

### ActivitySession
- SessionId (PK)  
- ActivityId (FK → Activity.ActivityId)  
- SessionDate  
- Capacity  
- CapacityLeft  
- Status {Scheduled, Cancelled, Completed}  
- CreatedAt
- UpdatedAt
- DeletedAt (NULL si pas annulée)  

**NOTE** : ActivitySession Cancelled : Statut cancelled (pas de hard delete).  

---

### Order
- OrderId (PK)  
- CartId (FK → Cart.CartId)  
- SessionId (FK → ActivitySession.SessionId)  
- TicketsQty  
- UnitPrice  
- CreatedAt  
- UpdatedAt  
- UNIQUE (CartId, SessionId)  

**NOTE** : pas de DeletedAt, dépend du statut de Cart.  

---

### Cart
- CartId (PK)  
- UserId (FK → User.UserId)  
- TotalPrice  
- Tax  
- PaymentMethod  
- PaymentDate (NULL si pas payé)  
- Status {Pending, Confirmed, Cancelled, Refunded}  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si pas annulé)  

**NOTE** :  
- Cart Pending = réservation non payée, peut être supprimée si User hard delete.  
- Cart Confirmed/Refunded = historique obligatoire → Cart conservé même si User supprimé.  
- Cart Deleted = conservé comme trace d’annulation.  
