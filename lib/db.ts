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

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient.$extends({
  query: {
    $allOperations({ model, operation, args, query }) {
      const maxRetries = 3;
      let delay = 500; // ms
      
      const execute = async (attempt: number): Promise<any> => {
        try {
          return await query(args);
        } catch (error: any) {
          // Check if it is a database connection / reachability / timeout error
          const isConnectionError = 
            error.code === "P1001" || 
            error.code === "P1002" || 
            error.code === "P1008" || 
            error.code === "P1017" ||
            error.message?.includes("Can't reach database server") ||
            error.message?.includes("timeout") ||
            error.message?.includes("connection") ||
            error.message?.includes("pool");

          if (isConnectionError && attempt < maxRetries) {
            console.warn(
              `Prisma connection error on ${model || "raw"}.${operation} (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${error.message || error}`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            return execute(attempt + 1);
          }
          throw error;
        }
      };

      return execute(1);
    },
  },
});
