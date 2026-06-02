## 🧩 Modèle Logique de Données (MLD)

Ce document décrit le modèle logique (**MLD**) de données du projet.  
- Le **MLD** ajoute les clés primaires/étrangères, les champs techniques et les règles de gestion (suppression, anonymisation).

---

### Users
- UsersId (PK)  
- RolesId (FK → Roles.RolesId)  
- Email (UNIQUE)  
- Firstname  
- Lastname  
- PasswordHash  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** :  
- Si aucun Orders → Users hard delete possible.  
- Si Orders Pending → Users hard delete possible (delete Users + Orders + OrdersLines).  
- Si Orders Confirmed/Refunded → Users soft delete possible + anonymisation obligatoire (Orders observés comme Refunded, historique conservé).  
- Si Orders Cancelled → Users soft delete possible (Orders conservés comme annulé).  

---

### Roles
- RolesId (PK)
- Name {member, admin}

---

### Activities
- ActivitiesId (PK)  
- Title  
- Description    
- ImageFilename  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Activities soft delete autorisé, historique conservé.  
---

### Categories
- CategoriesId (PK)  
- Title  
- Description  
- ImageFilename  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Categories soft delete autorisé, historique conservé.  

---

### ActivitiesCategories
- ActivitiesId (FK → Activities.ActivitiesId)  
- CategoriesId (FK → Categories.CategoriesId)  

---

### Sessions
- SessionsId (PK)  
- ActivitiesId (FK → Activities.ActivitiesId)  
- Date  
- Capacity  
- UnitPrice
- Status {Scheduled, Cancelled, Completed}  
- CreatedAt
- UpdatedAt
- DeletedAt (NULL si pas annulée)  

**NOTE** : Sessions Cancelled : Statut cancelled (pas de hard delete).  

---

### OrdersLines
- OrdersLinesId (PK)  
- OrdersId (FK → Orders.OrdersId)  
- SessionsId (FK → Sessions.SessionsId)  
- TicketsQty  
- Amount  
- CreatedAt  
- UpdatedAt  
- UNIQUE (CartId, SessionId)  

**NOTE** : pas de DeletedAt, dépend du statut de Cart.  

---

### Orders
- OrdersId (PK)  
- UsersId (FK → Users.UsersId)  
- Taxes  
- TotalAmount  
- PaymentMethod  
- PaymentDate (NULL si pas payé)  
- Status {Pending, Confirmed, Cancelled, Refunded}  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si pas annulé)  

**NOTE** :  
- Orders Pending = réservation non payée, peut être supprimée si User hard delete.  
- Orders Confirmed/Refunded = historique obligatoire → Cart conservé même si User supprimé.  
- Orders Deleted = conservé comme trace d’annulation.  
