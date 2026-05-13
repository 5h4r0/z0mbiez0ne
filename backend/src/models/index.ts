// import PrismaClient from the generated @prisma/client package
import { PrismaClient } from '@prisma/client';

// define a global container to hold the Prisma instance on globalThis
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// export a Prisma instance, reusing an existing one in dev or creating a new one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // configure logs depending on environment:
    // - production: only errors
    // - development: queries, info, warnings, and errors
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
  });

// in development mode, assign Prisma instance to globalThis to avoid multiple connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// define a graceful shutdown function to disconnect Prisma cleanly
const shutdown = async () => {
  try {
    // call Prisma disconnect
    await prisma.$disconnect();
    // log success and exit the process with code 0
    console.log('🔌 Prisma connection closed');
    process.exit(0);
  } catch (err) {
    // log error if disconnect fails and exit with code 1
    console.error('Error while closing Prisma connection:', err);
    process.exit(1);
  }
};

// listen for SIGINT (Ctrl+C) and call shutdown
process.on('SIGINT', shutdown);

// listen for SIGTERM (container stop, Kubernetes, etc.) and call shutdown
process.on('SIGTERM', shutdown);
