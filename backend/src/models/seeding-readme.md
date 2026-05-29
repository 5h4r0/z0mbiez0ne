# 🧪 Seeding Prisma — Readme

## ✅ À noter
- **roles + admin** → idempotent (`createMany` avec `skipDuplicates`, `upsert` pour l’admin).  
- **users Faker** → `createMany` + `skipDuplicates` (emails uniques).  
- **getRandomInt(min, max)** → pour toutes les valeurs entières.  
- **new Prisma.Decimal(...)** → pour forcer les nombres décimaux (`xx.00`).  
- **faker.helpers.arrayElement([...])** → pour choisir une valeur dans une liste.  

---

## 📋 Résumé
1. Roles fixes → `createMany` + `skipDuplicates`  
2. Admin fixe → `upsert` (email unique, password hashé avec bcrypt)  
3. Users Faker → `createMany` + `skipDuplicates`  
4. Catégories / activités / sessions → `createMany` (faker + getRandomInt)  
5. Orders + order_lines → `createMany` (liens aléatoires, `skipDuplicates` sur composite keys)  

---

## 🧪 Workflow du Seeding Prisma

Fonctionnement du fichier [`seeding.ts`](./seeding.ts).

---

## ⚙️ Exécution

npm run db:seed  
# ou  
npx tsx --env-file=.env src/models/seeding.ts  

---

## 🚀 Étapes du Seeding

1. Rôles fixes  
- Création de deux rôles : member, admin  
- createMany + skipDuplicates → idempotent  

2. Admin fixe  
- Email, prénom, nom, mot de passe définis dans .env  
- Mot de passe hashé avec bcrypt  
- upsert → met à jour si existe déjà, sinon crée  

3. Utilisateurs Faker  
- 10 membres générés aléatoirement  
- Faker → firstname, lastname, email, password  
- roles_id = 1 (member)  
- skipDuplicates → évite doublons d’email  

4. Catégories  
- Liste fixe de 10 catégories possibles  
- Génération de 10 catégories  
- Faker → description  
- Image : nom fichier → category-name.webp  

5. Activités  
- Liste fixe de 30 activités  
- Génération de 30 activités  
- Faker → description  
- Image : nom fichier → activity-name.webp  

6. Jointure activités ↔ catégories  
- Chaque activité est associée à 1 ou 2 catégories  
- flatMap → tableau plat d’associations  
- skipDuplicates → évite doublons (clé composite unique)  

7. Sessions  
- Génération de 10 sessions liées à une activité (activity_id)  
- Faker → date, capacity, status  
- Prix généré (entier) → stocké en Decimal(xx.00) via Prisma.Decimal  

8. Orders  
- Génération de 5 orders liés à un utilisateur member (users_id)  
- taxes : Decimal(3,2) → plage 0.00–20.00  
- total_amount : Decimal(4,2) → plage 20.00–200.00  
- Méthodes de paiement : Card, Paypal, Wire transfer  

9. Orders_lines  
- Génération de 15 lignes, chacune reliant un order à une session  
- tickets_qty aléatoire 1–5  
- amount : Decimal(3,2) → plage 10.00–100.00  
- Clé composite (orders_id, sessions_id) → skipDuplicates  

10. Fin du script  
- Log de succès ou erreur  
- Fermeture propre de la connexion Prisma (prisma.$disconnect())  

---

## ✅ Points clés à retenir
- Idempotence : grâce à skipDuplicates et upsert, le script peut être rejoué sans planter.  
- Relations respectées : users → orders → orders_lines, activities → sessions.  
- Faker : génère des données variées mais cohérentes (emails, dates, textes).  
- Decimal : utilise Prisma.Decimal pour respecter les tailles cohérentes avec le schéma SQL (éviter les overflows).  

---

## 🌳 Seeding Workflow (vue relationnelle)

├── Roles  
│   ├── member  
│   └── admin  
│  
├── Admin (fixe, upsert)  
│   └── lié à Roles.id = 2  
│  
├── Users Faker (10 membres aléatoires)  
│   └── liés à Roles.id = 1  
│  
├── Catégories (10)  
│  
├── Activités (30)  
│   └── reliées aux Catégories via Activities_Categories (table de jointure)  
│  
├── Sessions (50)  
│   └── contiennent infos de capacité, prix, date  
│  
├── Orders (10)  
│   └── liés à Users (clé étrangère users_id)  
│  
└── Orders_lines (25)  
    ├── liés à Orders (clé étrangère orders_id)  
    └── liés à Sessions (clé étrangère sessions_id)  
        → clé composite (orders_id + sessions_id) pour éviter doublons  

---

## Exemple condensé (`seeding.ts`)

```ts
import { prisma } from "./index.js"
import { faker } from "@faker-js/faker"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// 1. Créer des rôles fixes (idempotent)
await prisma.roles.createMany({
  data: [{ name: "member" }, { name: "admin" }],
  skipDuplicates: true
})

// 2. Créer un admin fixe (hashé, upsert → rejouable)
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "hastur", 10)
await prisma.users.upsert({
  where: { email: process.env.ADMIN_EMAIL ?? "steph@sharo.fr" },
  update: {
    firstname: "Jean-Michel",
    lastname: "Marketing",
    password_hash: passwordHash,
    roles_id: 2
  },
  create: {
    email: "steph@sharo.fr",
    firstname: "Jean-Michel",
    lastname: "Marketing",
    password_hash: passwordHash,
    roles_id: 2
  }
})

// 3. Générer 10 users Faker
await prisma.users.createMany({
  data: Array.from({ length: 10 }).map(() => ({
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password_hash: faker.internet.password(),
    roles_id: 1
  })),
  skipDuplicates: true
})

// 4. Générer catégories, activités, sessions
await prisma.categories.createMany({
  data: Array.from({ length: 10 }).map(() => ({
    title: faker.commerce.department(),
    description: faker.lorem.paragraph(),
    image_filename: `activity-${makeSlug(title)}.webp`
  }))
})

await prisma.activities.createMany({
  data: Array.from({ length: 30 }).map(() => ({
    title: faker.commerce.productName(),
    description: faker.lorem.sentences(2),
    image_filename: `category-${makeSlug(title)}.webp`
  }))
})

await prisma.sessions.createMany({
  data: Array.from({ length: 50 }).map(() => ({
    date: faker.date.soon(),
    capacity: getRandomInt(10, 50),
    unit_price: new Prisma.Decimal(faker.number.int({ min: 20, max: 50 })),
    status: faker.helpers.arrayElement(["Scheduled", "Cancelled", "Completed"])
  }))
})

// 5. Générer orders et orders_lines
await prisma.orders.createMany({
  data: Array.from({ length: 10 }).map(() => ({
    users_id: getRandomInt(1, 10),
    taxes: new Prisma.Decimal(faker.number.float({ min: 0, max: 20, multipleOf: 0.01 })),
    total_amount: new Prisma.Decimal(faker.number.int({ min: 20, max: 200 })),
    payment_method: faker.helpers.arrayElement(["Card", "Paypal", "Wire transfer"]),
    payment_date: faker.date.recent(),
    status: faker.helpers.arrayElement(["Pending", "Confirmed", "Cancelled", "Refunded"])
  }))
})

await prisma.orders_lines.createMany({
  data: Array.from({ length: 25 }).map(() => ({
    orders_id: getRandomInt(1, 5),
    sessions_id: getRandomInt(1, 10),
    tickets_qty: getRandomInt(1, 5),
    amount: new Prisma.Decimal(faker.number.int({ min: 10, max: 100 }))
  })),
  skipDuplicates: true
})
```

---

## 🛠️ Commandes utiles

### Réinitialiser la base de données (drop + migrate + seed)
npm run db:reset

### Générer le client Prisma (nécessaire après modification du schema.prisma)
npm run db:generate

### Exécuter uniquement le seeding
npm run db:seed

### Lancer Prisma Studio (UI pour explorer la base, si désiré)
npm run db:studio
