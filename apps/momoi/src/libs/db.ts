import { prisma as prismaFactory, type PrismaDB } from "database";
import { createMockPrisma } from "@momoi/libs/db.mock";

import { env } from "@momoi/libs/env";

// Create a Prisma client instance (or an in-memory mock in tests)
export const db = (env.NODE_ENV === "test" ? createMockPrisma() : prismaFactory()) as PrismaDB;
