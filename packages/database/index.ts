import { PrismaClient } from "./generated/prisma-client";

/**
 * Create a Prisma client (lazy). Call once and reuse.
 */
export const prisma = () => new PrismaClient();

export type PrismaDB = ReturnType<typeof prisma>;

// Export mock utilities
export * from "./mocks/";