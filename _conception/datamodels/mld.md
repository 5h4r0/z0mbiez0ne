## 🧩 Modèle Logique de Données (MLD)

### Roles
- RoleId (PK)
- Name {member, admin}

---

### Users
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

### Categories
- CategoryId (PK)  
- Title  
- Description  
- Image  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Category soft delete autorisé, historique conservé.  

---

### Activities
- ActivityId (PK)  
- CategoryId (FK → Category.CategoryId)  
- Title  
- Description    
- Image  
- CreatedAt  
- UpdatedAt  
- DeletedAt (NULL si actif)  

**NOTE** : Activity soft delete autorisé, historique conservé.  

---

### ActivitySessions
- SessionId (PK)  
- ActivityId (FK → Activity.ActivityId)  
- SessionDate  
- Capacity  
- UnitPrice
- Status {Scheduled, Cancelled, Completed}  
- CreatedAt
- UpdatedAt
- DeletedAt (NULL si pas annulée)  

**NOTE** : ActivitySession Cancelled : Statut cancelled (pas de hard delete).  

---

### Orders
- OrderId (PK)  
- CartId (FK → Cart.CartId)  
- SessionId (FK → ActivitySession.SessionId)  
- TicketsQty  
- Amount  
- CreatedAt  
- UpdatedAt  
- UNIQUE (CartId, SessionId)  

**NOTE** : pas de DeletedAt, dépend du statut de Cart.  

---

### Carts
- CartId (PK)  
- UserId (FK → User.UserId)  
- Taxes  
- TotalAmount  
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
