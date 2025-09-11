# 📘 Modèle Conceptuel et Logique de Données (MCD & MLD)

Ce document décrit le modèle conceptuel (**MCD**) et le modèle logique (**MLD**) de données du projet.  
- Le **MCD** présente uniquement les entités et associations métier.  
- Le **MLD** ajoute les clés primaires/étrangères, les champs techniques et les règles de gestion (suppression, anonymisation).  

---

## 🧩 Modèle Conceptuel de Données (MCD)

### Entités

#### Roles
- RoleCode
- Name  

#### Users
- UserCode  
- Role {member, admin} 
- Email  
- Firstname  
- Lastname  
- PasswordHash  
 
#### Roles
- RoleCode
- Name  

#### Categories
- CategoryCode  
- Title  
- Description  
- Image  

#### Activities
- ActivityCode  
- Title  
- Description  
- Image  

#### ActivitySessions
- SessionCode  
- SessionDate  
- Capacity  
- UnitPrice  
- Status {Scheduled, Cancelled, Completed}  

#### Orders
- OrderCode    
- TicketsQty 
- Amount  

#### Carts
- CartCode  
- TotalAmount  
- Taxes  
- PaymentMethod  
- PaymentDate  
- Status {Pending, Confirmed, Cancelled, Refunded}  

---

### Associations & Cardinalités

OWN  
Activity (1,1) ---- (0,N) Category  
- Une **Activities** doit appartenir à une **Categories**.  
- Une **Categories** peut contenir zéro, une ou plusieurs **Activities** (catégorie vide autorisée).  

PLANIFIER  
Activity (0,N) ---- (1,1) ActivitySession  
- Une **Activities** peut avoir zéro ou plusieurs **ActivitySessions**.  
- Chaque **ActivitySessions** est liée à une et une seule **Activities**.  

PASSER  
User (0,N) ---- (1,1) Cart  
- Un **Users** peut passer zéro ou plusieurs commandes **Carts**.  
- Chaque **Carts** appartient à un seul **Users**.  

POSSÈDE  
Cart (0,N) ---- (1,1) Order  
- Un **Carts** contient zéro ou plusieurs **Orders**.  
- Chaque **Orders** appartient à un seul **Carts**.  

CIBLER  
Order (1,1) ---- (0,N) ActivitySession  
- Chaque **Orders** cible une **ActivitySessions**.  
- Une **ActivitySessions** peut apparaître dans plusieurs **Orders** (sur plusieurs utilisateurs).  

CARACTÉRISE
Role (0,N) --- (1,1) User
- Un **Roles** caractérise zéro ou plusieurs **Users**.
- Chaque **Users** n'est caractérisé que par un seul **Roles**.
