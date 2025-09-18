import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  // Exemple : création d'un rôle
  await prisma.roles.createMany({
    data: [
      { name: 'member' },
      { name: 'admin' },
    ],
    skipDuplicates: true,
  })

  // Exemple : création d'un user fake
  await prisma.users.create({
    data: {
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      password_hash: faker.internet.password(),
      roles_id: 1,
    },
  })
}

main()
  .then(() => console.log("Seeding terminé ✅"))
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect())