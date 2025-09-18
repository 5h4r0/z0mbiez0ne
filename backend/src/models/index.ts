// Import du client Prisma généré automatiquement dans node_modules/@prisma/client
// Ce package est régénéré à chaque "prisma generate"
import { PrismaClient } from '@prisma/client'

// Déclaration d'une variable globale pour stocker l'instance Prisma
// - globalThis est l'objet global en JS (équivalent window en browser ou global en Node)
// - "as unknown as { prisma?: PrismaClient }" force TypeScript à accepter une
//   propriété "prisma" optionnelle qui n'existe pas dans le typage natif de globalThis
// - Cela permet de tester si une instance existe déjà (prisma?) ou non
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Export d'une instance unique de PrismaClient
// - Si une instance existe déjà dans globalForPrisma, elle est réutilisée
// - Sinon, une nouvelle instance est créée avec une configuration adaptée à l'environnement
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Configuration des logs Prisma
    // - En production : uniquement les erreurs critiques
    // - En développement : toutes les informations (requêtes SQL, infos, warnings, erreurs)
    log: process.env.NODE_ENV === 'production'
      ? ['error']
      : ['query', 'info', 'warn', 'error'],
  })

// Stockage de l'instance Prisma dans globalThis en environnement de développement
// - En production, inutile car le process Node ne redémarre pas en boucle
// - En développement (hot reload via nodemon, tsx --watch, etc.), évite
//   de créer une nouvelle connexion à chaque reload et limite les fuites de connexions
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
