import { drizzle } from "drizzle-orm/bun-sql";
import { drizzle as createMockDb } from "drizzle-orm/sqlite-proxy";
import { record } from "@elysiajs/opentelemetry";

import * as better_auth from "./schema/auth/better-auth";
import * as user from "./schema/auth/user";
import * as instances from "./schema/core/instances";
import * as network from "./schema/core/network";
import * as samester from "./schema/core/samester";

/**
 * Create a database connection.
 * @param uri Database connection string
 * @returns A Drizzle ORM database instance
 */
export const db = (uri: string) => record("db.connection", () => drizzle(uri));

/** Database instance type */
export type DB = ReturnType<typeof db>;

// export const mock_db = db("postgres://user:password@localhost:5433/postgres");

// Mock database for testing - returns empty results but maintains schema structure
export const mock_db = createMockDb(
  async (sql, params, method) => {
    // Log queries only in debug mode (you can enable this when needed)
    // console.log(`Query: ${sql}`);
    // if (params && params.length > 0) {
    //   console.log(`Params: ${params.join(', ')}`);
    // }

    // Always return the expected format with rows array
    return { rows: [] };
  },
  {
    schema: {
      ...better_auth,
      ...user,
      ...instances,
      ...network,
      ...samester,
    },
    logger: false, // Disable logging for cleaner test output
  }
);
