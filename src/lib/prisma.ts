// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ["query", "error", "warn"], // Optional: logs SQL queries in your console during dev
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client instance for interacting with the database.
 * neonPool is commented out because the installed Prisma adapter for Neon handles the connection pooling internally.
 * PrismaNeon is expecting a configuration object with the connection string.
 * Otherwise, results to 500 error
 */
//const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
//const adapter = new PrismaNeon(neonPool);
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}