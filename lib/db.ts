import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prefer the direct non-pooled connection (port 5432) for reliable Prisma sessions.
// POSTGRES_PRISMA_URL uses PgBouncer (port 6543 / transaction mode) which can cause
// intermittent P1001 "Can't reach database" errors with Prisma's connection handling.
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
