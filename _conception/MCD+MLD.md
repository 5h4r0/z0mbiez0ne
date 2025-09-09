# 📘 Modèle Conceptuel et Logique de Données (MCD & MLD)

Ce document décrit le modèle conceptuel (**MCD**) et le modèle logique (**MLD**) de données du projet.  
- Le **MCD** présente uniquement les entités et associations métier.  
- Le **MLD** ajoute les clés primaires/étrangères, les champs techniques et les règles de gestion (suppression, anonymisation).  

---

## 🧩 Modèle Conceptuel de Données (MCD)

### Entités

#### User
- UserEmail  
- Firstname  
- Lastname  
- Password  
- Role {user, admin}  

#### Category
- Title  
- Description  
- Image  

#### Activity
- Title  
- Description  
- Price  
- Image  

#### ActivitySession
- SessionDate  
- Capacity  
- Status {Scheduled, Cancelled, Completed}  

#### Order
- Status {Draft, Pending, Confirmed, Cancelled, Refunded}  
- TotalPrice  
- PaymentMethod  

#### OrderLine
- TicketsNumber  
- UnitPrice  

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
User (0,N) ---- (1,1) Order  
- Un **User** peut passer zéro ou plusieurs **Orders**.  
- Chaque **Order** appartient à un seul **User**.  

COMPRENDRE  
Order (0,N) ---- (1,1) OrderLine  
- Un **Order** contient une ou plusieurs **OrderLines**.  
- Chaque **OrderLine** appartient à un seul **Order**.  

CIBLER  
OrderLine (1,1) ---- (0,N) ActivitySession  
- Chaque **OrderLine** cible une **ActivitySession**.  
- Une **ActivitySession** peut apparaître dans plusieurs **OrderLines** (réservée par plusieurs utilisateurs).  

---

## 🧩 Modèle Logique de Données (MLD)

### User
- UserId (PK)  
- Email (UNIQUE)  
- Firstname  
- Lastname  
- PasswordHash  
- Role {user, admin}  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** :  
- Si aucun Order → hard delete possible  
- Si Orders Draft/Pending → hard delete possible (supprimer User + Orders + Lines)  
- Si Orders Confirmed/Refunded → soft delete + anonymisation obligatoire (garder historique)  
- Si Orders Cancelled → soft delete (Order conservé comme annulé)  

---

### Category
- CategoryId (PK)  
- Title  
- Description  
- Image  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Soft delete autorisé, historique conservé.  

---

### Activity
- ActivityId (PK)  
- Title  
- Description  
- Price  
- Image  
- CategoryId (FK → Category.CategoryId)  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Soft delete autorisé, historique conservé.  

---

### ActivitySession
- SessionId (PK)  
- ActivityId (FK → Activity.ActivityId)  
- SessionDate  
- Capacity  
- Status {Scheduled, Cancelled, Completed}  
- CreatedAt  
- UpdatedAt  
- CancelDate (NULL si pas annulée)  

**NOTE** : Suppression = statut Cancelled (pas de hard delete).  

---

### Order
- OrderId (PK)  
- UserId (FK → User.UserId)  
- Status {Draft, Pending, Confirmed, Cancelled, Refunded}  
- TotalPrice  
- PaymentMethod  
- PaymentDate (NULL si pas payé)  
- CancelDate (NULL si pas annulé)  
- CreatedAt  
- UpdatedAt  

**NOTE** :  
- Draft = panier, peut être supprimé si User hard delete  
- Pending = réservation non payée, peut être supprimée si User hard delete  
- Confirmed/Refunded = historique obligatoire → Order conservé même si User supprimé  
- Cancelled = conservé comme trace d’annulation  

---

### OrderLine
- LineId (PK)  
- OrderId (FK → Order.OrderId)  
- SessionId (FK → ActivitySession.SessionId)  
- TicketsNumber  
- UnitPrice  
- CreatedAt  
- UpdatedAt  
- UNIQUE (OrderId, SessionId)  

**NOTE** : pas de DeletedAt, dépend du statut d’Order.  
