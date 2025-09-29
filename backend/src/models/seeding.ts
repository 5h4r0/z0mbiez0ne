// src/models/seeding.ts
/**
 * Script de seeding (Prisma + Faker)
 * Exécution :
 *   npm run db:seed
 *   ou
 *   npx tsx --env-file=.env src/models/seeding.ts
 */

import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { makeSlug } from "../utils/slugify.js";
import { prisma } from "./index.js";

/** Utilitaire : entier aléatoire inclusif [min, max] */
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Utilitaire : créer un Decimal à partir de centimes (ex: 199 → 1.99) */
const decimalFromCents = (cents: number) =>
  new Prisma.Decimal((cents / 100).toFixed(2));

/** Variables depuis .env (fallbacks dev) */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "steph@sharo.fr";
const ADMIN_FIRSTNAME = process.env.ADMIN_FIRSTNAME ?? "Stéphane";
const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME ?? "Jeankev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "hastur";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

async function main() {
  /** Rôles fixes */
  await prisma.roles.createMany({
    data: [{ name: "member" }, { name: "admin" }],
    skipDuplicates: true,
  });

  /** Admin fixe (upsert + bcrypt) */
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

  await prisma.users.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      firstname: ADMIN_FIRSTNAME,
      lastname: ADMIN_LASTNAME,
      password_hash: passwordHash,
      role_id: 2, // admin
    },
    create: {
      email: ADMIN_EMAIL,
      firstname: ADMIN_FIRSTNAME,
      lastname: ADMIN_LASTNAME,
      password_hash: passwordHash,
      role_id: 2, // admin
    },
  });

  /** 10 users Faker (members) - emails uniques → skipDuplicates utile */
  await prisma.users.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      password_hash: faker.internet.password(),
      role_id: 1, // member
    })),
    skipDuplicates: true,
  });

  /** Catégories */
  const CATEGORIES = [
    "Attractions à Sensations",
    "Spectacles Horrifiques",
    "Expériences Immersives",
    "Zones Interdites",
    "Pour Enfants",
    "Jeux & Arcades",
    "Escape Rooms",
    "Simulations & VR",
    "Classiques du Parc",
    "Événements Spéciaux",
  ];

  await prisma.categories.createMany({
    data: Array.from({ length: 5 }).map(() => {
      const title = faker.helpers.arrayElement(CATEGORIES);
      return {
        title,
        description: faker.lorem.sentences(2),
        image_filename: `img-category-${getRandomInt(1, 999)}.jpg`,
        slug: makeSlug(title)
      }
    }),
    skipDuplicates: true, // optionnel mais sans risque
  });

  /** Activités */
  const ACTIVITIES = [
    "Train Fantôme",
    "Maison Hantée",
    "Roller Coaster du Chaos",
    "Chaises Volantes Sanglantes",
    "Spectacle de Magie Noire",
    "Parcours Zombie",
    "Salle VR Apocalypse",
    "Tir aux Canards Mutants",
    "Labyrinthe des Miroirs",
    "Tour de la Peur",
    "Cimetière des Âmes Perdues",
    "Cabane du Boucher",
    "Escape Room Infernale",
    "Montagnes Russes de l’Enfer",
    "Marécage des Mutants",
    "Hôpital Abandonné",
    "Manoir du Docteur Fou",
    "Château des Cris Éternels",
    "Souterrains du Désespoir",
    "Cirque des Clowns Démoniaques",
    "Pont Suspendu Maudit",
    "Simulateur de Crash Aérien",
    "Chambre des Tortures",
    "Forêt des Pendus",
    "Spectacle Pyro-Zombie",
    "Rivière de Sang",
    "Zone Quarantaine Biohazard",
    "Tour de Chute Libre",
    "Grande Roue des Ombres",
    "Crypte des Vampires",
  ];

  await prisma.activities.createMany({
    data: Array.from({ length: 10 }).map(() => {
      const title = faker.helpers.arrayElement(ACTIVITIES);
      return {
        title,
        description: faker.lorem.sentences(2),
        image_filename: `img-activity-${getRandomInt(1, 999)}.jpg`,
        slug: makeSlug(title)
      }
    }),
    skipDuplicates: true, // optionnel
  });

  /** Jointure activités ↔ catégories: chaque activité reçoit 1, 2 ou 3 catégories, flatMap produit un tableau plat */
  const allActivities = await prisma.activities.findMany({
    select: {
      id: true
    }
  });
  const allCategories = await prisma.categories.findMany({
    select: {
      id: true
    }
  });

  const ACTIVITY_CATEGORY_LINKS = allActivities.flatMap((activity) => {
    const chosenCategorie = faker.helpers.arrayElements(allCategories, getRandomInt(1, 3));
    return chosenCategorie.map((categorie) => ({
      activity_id: activity.id,
      category_id: categorie.id,
    }));
  });

  await prisma.activities_categories.createMany({
    data: ACTIVITY_CATEGORY_LINKS,
    skipDuplicates: true, // protège la clé composite
  });

  /** Sessions liées aux activités : nécessite un champ activity_id dans le modèle sessions, prix entiers → stockés comme xx.00 */
  await prisma.sessions.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      activity_id: faker.helpers.arrayElement(allActivities).id,
      date: faker.date.soon({ days: 30 }),
      capacity: getRandomInt(10, 50),
      unit_price: new Prisma.Decimal(getRandomInt(20, 50)), // OK si @db.Decimal(5,2)
      status: faker.helpers.arrayElement(["Scheduled", "Cancelled", "Completed"]),
    })),
  });

  /** Orders : liés à des users members (exclusion explicite de l'admin), taxes : Decimal(3,2) → plage 0.00–9.99, total_amount : Decimal(4,2) → plage 20.00–99.99 */
  const memberUser = await prisma.users.findMany({
    where: { role_id: 1 },
    select: { id: true },
  });

  await prisma.orders.createMany({
    data: Array.from({ length: 5 }).map(() => ({
      user_id: faker.helpers.arrayElement(memberUser).id,
      taxes: decimalFromCents(getRandomInt(0, 999)), // 0.00 → 9.99
      total_amount: new Prisma.Decimal(getRandomInt(20, 99)), // 20.00 → 99.00
      payment_method: faker.helpers.arrayElement(["Card", "Paypal", "Wire transfer"]),
      payment_date: faker.date.recent(),
      status: faker.helpers.arrayElement(["Pending", "Confirmed", "Cancelled", "Refunded"]),
    })),
  });

  /** Orders_lines : clé composite unique (order_id, session_id), amount : Decimal(3,2) → 1.00–9.99 (seed simple) */
  const allOrders = await prisma.orders.findMany({ select: { id: true } });
  const allSessions = await prisma.sessions.findMany({ select: { id: true } });

  await prisma.orders_lines.createMany({
    data: Array.from({ length: 15 }).map(() => {
      const order = faker.helpers.arrayElement(allOrders);
      const session = faker.helpers.arrayElement(allSessions);
      return {
        order_id: order.id,
        session_id: session.id,
        tickets_qty: getRandomInt(1, 5),
        amount: decimalFromCents(getRandomInt(100, 999)), // 1.00 → 9.99
      };
    }),
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("✅ Seeding terminé avec succès"))
  .catch((e) => {
    console.error("❌ Erreur dans le seeding: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
