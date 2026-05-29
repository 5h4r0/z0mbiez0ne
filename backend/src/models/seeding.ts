// src/models/seeding.ts
/**
 * seeding script (prisma + faker)
 * run with :
 *   npm run db:seed
 *   or
 *   npx tsx --env-file=.env src/models/seeding.ts
 */

import { faker } from '@faker-js/faker';
import { OrderStatus, Prisma, SessionStatus } from '@prisma/client';
import argon2 from 'argon2';
import { makeSlug } from '../utils/slugify.js';
import { prisma } from './index.js';

/** random int util */
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** decimal util from cents (199 -> 1.99) */
const decimalFromCents = (cents: number) => new Prisma.Decimal((cents / 100).toFixed(2));

/** env vars with fallbacks */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'steph@sharo.fr';
const ADMIN_FIRSTNAME = process.env.ADMIN_FIRSTNAME ?? 'Steph';
const ADMIN_LASTNAME = process.env.ADMIN_LASTNAME ?? 'Alumni OClock';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '!!n1n2n3n4N5';

async function main() {
  // clean all tables in fk order
  await prisma.orders_lines.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.activities_categories.deleteMany();
  await prisma.activities.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.users.deleteMany();
  await prisma.roles.deleteMany();

  // seed roles
  await prisma.roles.createMany({
    data: [{ name: 'member' }, { name: 'admin' }],
    skipDuplicates: true,
  });

  // seed member users
  const memberRole = await prisma.roles.findUnique({ where: { name: 'member' } });
  if (!memberRole) {
    throw new Error('member role missing');
  }
  await prisma.users.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      password_hash: faker.internet.password(),
      role_id: memberRole.id,
    })),
    skipDuplicates: true,
  });

  // seed static admin
  const passwordHash = await argon2.hash(ADMIN_PASSWORD);

  try {
    const adminRole = await prisma.roles.findUnique({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('admin role missing');
    }
    await prisma.users.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        firstname: ADMIN_FIRSTNAME,
        lastname: ADMIN_LASTNAME,
        password_hash: passwordHash,
        role_id: adminRole.id,
      },
      create: {
        email: ADMIN_EMAIL,
        firstname: ADMIN_FIRSTNAME,
        lastname: ADMIN_LASTNAME,
        password_hash: passwordHash,
        role_id: adminRole.id,
      },
    });
  } catch (e) {
    console.error('❌ seeding admin failed:', e);
    throw e;
  }

  // categories
  const CATEGORIES = [
    'Attractions à Sensations',
    'Spectacles Horrifiques',
    'Expériences Immersives',
    'Zones Interdites',
    'Pour Enfants',
    'Jeux & Arcades',
    'Escape Rooms',
    'Simulations & VR',
    'Classiques du Parc',
    'Événements Spéciaux',
  ];

  await prisma.categories.createMany({
    data: faker.helpers.shuffle([...CATEGORIES]).map((title) => ({
      title,
      description: faker.lorem.sentences(2),
      image_filename: `category-${makeSlug(title)}.webp`,
      slug: makeSlug(title),
    })),
    skipDuplicates: true,
  });

  // activities
  const ACTIVITIES = [
    'Train Fantôme',
    'Maison Hantée',
    'Roller Coaster du Chaos',
    'Chaises Volantes Sanglantes',
    'Spectacle de Magie Noire',
    'Parcours Zombie',
    'Salle VR Apocalypse',
    'Tir aux Canards Mutants',
    'Labyrinthe des Miroirs',
    'Tour de la Peur',
    'Cimetière des Âmes Perdues',
    'Cabane du Boucher',
    'Escape Room Infernale',
    "Montagnes Russes de l'Enfer",
    'Marécage des Mutants',
    'Hôpital Abandonné',
    'Manoir du Docteur Fou',
    'Château des Cris Éternels',
    'Souterrains du Désespoir',
    'Cirque des Clowns Démoniaques',
    'Pont Suspendu Maudit',
    'Simulateur de Crash Aérien',
    'Chambre des Tortures',
    'Forêt des Pendus',
    'Spectacle Pyro-Zombie',
    'Rivière de Sang',
    'Zone Quarantaine Biohazard',
    'Tour de Chute Libre',
    'Grande Roue des Ombres',
    'Crypte des Vampires',
  ];

  await prisma.activities.createMany({
    data: faker.helpers.shuffle([...ACTIVITIES]).map((title) => ({
      title,
      description: faker.lorem.sentences(2),
      image_filename: `activity-${makeSlug(title)}.webp`,
      slug: makeSlug(title),
    })),
    skipDuplicates: true,
  });

  // link activities and categories
  const allActivities = await prisma.activities.findMany({ select: { id: true } });
  const allCategories = await prisma.categories.findMany({ select: { id: true } });

  const ACTIVITY_CATEGORY_LINKS = allActivities.flatMap((activity) => {
    const chosenCategorie = faker.helpers.arrayElements(allCategories, getRandomInt(1, 3));
    return chosenCategorie.map((categorie) => ({
      activity_id: activity.id,
      category_id: categorie.id,
    }));
  });

  await prisma.activities_categories.createMany({
    data: ACTIVITY_CATEGORY_LINKS,
    skipDuplicates: true,
  });

  // sessions
  await prisma.sessions.createMany({
    data: Array.from({ length: 50 }).map(() => ({
      activity_id: faker.helpers.arrayElement(allActivities).id,
      date: faker.date.soon({ days: 30 }),
      capacity: getRandomInt(10, 50),
      unit_price: new Prisma.Decimal(getRandomInt(20, 50)),
      status: faker.helpers.arrayElement([SessionStatus.Scheduled, SessionStatus.Cancelled, SessionStatus.Completed]),
    })),
  });

  // orders linked to member users
  const memberRoleForOrders = await prisma.roles.findUnique({ where: { name: 'member' } });
  if (!memberRoleForOrders) {
    throw new Error('member role missing');
  }
  const memberUsers = await prisma.users.findMany({
    where: { role_id: memberRoleForOrders.id },
    select: { id: true },
  });
  await prisma.orders.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      user_id: faker.helpers.arrayElement(memberUsers).id,
      taxes: decimalFromCents(getRandomInt(0, 999)),
      total_amount: new Prisma.Decimal(getRandomInt(20, 99)),
      payment_method: faker.helpers.arrayElement(['Card', 'Paypal', 'Wire transfer']),
      payment_date: faker.date.recent(),
      status: faker.helpers.arrayElement([
        OrderStatus.Pending,
        OrderStatus.Confirmed,
        OrderStatus.Cancelled,
        OrderStatus.Refunded,
      ]),
    })),
  });

  // orders_lines
  const allOrders = await prisma.orders.findMany({ select: { id: true } });
  const allSessions = await prisma.sessions.findMany({ select: { id: true } });

  const usedPairs = new Set<string>();
  const orderLinesData: {
    order_id: number;
    session_id: number;
    tickets_qty: number;
    amount: Prisma.Decimal;
  }[] = [];

  while (orderLinesData.length < 25) {
    const order = faker.helpers.arrayElement(allOrders);
    const session = faker.helpers.arrayElement(allSessions);
    const key = `${order.id}-${session.id}`;
    if (!usedPairs.has(key)) {
      usedPairs.add(key);
      orderLinesData.push({
        order_id: order.id,
        session_id: session.id,
        tickets_qty: getRandomInt(1, 5),
        amount: decimalFromCents(getRandomInt(100, 999)),
      });
    }
  }

  await prisma.orders_lines.createMany({ data: orderLinesData });
}

main()
  .then(() => console.log('🌱 seeding finished'))
  .catch((e) => {
    console.error('❌ error in seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
