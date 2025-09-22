# 📘 Modèle Conceptuel de données (MCD)

Ce document décrit le modèle conceptuel (**MCD**) de données du projet.  
- Le **MCD** présente uniquement les entités et associations métier.  

---

## 🧩 Modèle Conceptuel de Données (MCD)

### Entités

#### Users
- UsersCode  
- Role {member, admin} 
- Email  
- Firstname  
- Lastname  
- PasswordHash  
 
#### Roles
- RolesCode
- Name  

#### Activities
- ActivitiesCode  
- Title  
- Description  
- ImageFilename  

#### Categories
- CategoriesCode  
- Title  
- Description  
- ImageFilename  

#### ActivitiesCategories
- ActivitiesCode  
- CategoriesCode

#### Sessions
- SessionsCode  
- Date  
- Capacity  
- UnitPrice  
- Status {Scheduled, Cancelled, Completed}  

#### OrdersLines
- OrdersLinesCode    
- TicketsQty 
- Amount  

#### Orders
- OrdersCode  
- TotalAmount  
- Taxes  
- PaymentMethod  
- PaymentDate  
- Status {Pending, Confirmed, Cancelled, Refunded}  

---

### Associations & Cardinalités

OWN  
Activities (1,N) ---- (0,N) Categories  
- Une **Activities** peut appartenir à plusieurs **Categories**.  
- Une **Categories** peut contenir zéro, une, ou plusieurs **Activities** (catégorie vide autorisée).  

PLANIFIER  
Activity (0,N) ---- (1,1) ActivitySession  
- Une **Activities** peut avoir zéro ou plusieurs **Sessions**.  
- Chaque **Sessions** est liée à une et une seule **Activities**.  

PASSER  
User (0,N) ---- (1,1) Orders  
- Un **Users** peut passer zéro ou plusieurs commandes **Orders**.  
- Chaque **Orders** appartient à un seul **Users**.  

POSSÈDE  
Cart (0,N) ---- (1,1) Order  
- Un **Orders** contient zéro ou plusieurs **OrdersLines**.  
- Chaque **OrdersLines** appartient à un seul **Orders**.  

CIBLER  
Order (1,1) ---- (0,N) ActivitySession  
- Chaque **OrdersLines** cible une **Sessions**.  
- Une **Sessions** peut apparaître dans plusieurs **OrdersLines** (sur plusieurs utilisateurs).  

CARACTÉRISE
Role (0,N) --- (1,1) User
- Un **Roles** caractérise zéro ou plusieurs **Users**.
- Chaque **Users** n'est caractérisé que par un seul **Roles**.
