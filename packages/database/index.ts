import { drizzle } from "drizzle-orm/bun-sql";
import { record } from "@elysiajs/opentelemetry";

import * as better_auth from "database/schema/auth/better-auth";
import * as user from "database/schema/auth/user";
import * as instance from "database/schema/core/instances";
import * as network from "database/schema/core/network";
import * as samester from "database/schema/core/samester";

/**
 * Create a database connection.
 * @param uri Database connection string
 * @returns A Drizzle ORM database instance
 */
export const db = (uri: string) => record("db.connection", () => drizzle(uri));

/** Database instance type */
export type DB = ReturnType<typeof db>;

export const mock_db = drizzle.mock({
  schema: {
    ...better_auth,
    ...user,
    ...instance,
    ...network,
    ...samester,
  }
});
