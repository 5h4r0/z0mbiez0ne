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

OWN  
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
Order (1,1) ---- (0,N) ActivitySession  
- Chaque **Order** cible une **ActivitySession**.  
- Une **ActivitySession** peut apparaître dans plusieurs **Order** (sur plusieurs utilisateurs).  

CARACTÉRISE
Role (0,N) --- (1,1) User
- Un **Role** caractérise zéro ou plusieurs **User**.
- Chaque **User** n'est caractérisé que par un seul **Role**.
