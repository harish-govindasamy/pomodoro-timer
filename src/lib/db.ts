import { PrismaClient } from "@prisma/client";

// Global singleton for local development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Standard Prisma client for local development (SQLite)
 * This is used when running locally with `npm run dev`
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * For Cloudflare D1 deployment:
 *
 * When deploying to Cloudflare, use the following pattern in API routes:
 *
 * ```typescript
 * import { PrismaClient } from "@prisma/client";
 * import { PrismaD1 } from "@prisma/adapter-d1";
 *
 * export async function GET(request: Request, env: { DB: D1Database }) {
 *   const adapter = new PrismaD1(env.DB);
 *   const prisma = new PrismaClient({ adapter });
 *   // ... your database operations
 * }
 * ```
 *
 * The D1Database type comes from @cloudflare/workers-types which is
 * automatically available in Cloudflare Workers/Pages environment.
 */
