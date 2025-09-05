import { drizzle } from "drizzle-orm/bun-sql";
import { record } from "@elysiajs/opentelemetry";

/**
 * Create a database connection.
 * @param uri Database connection string
 * @returns A Drizzle ORM database instance
 */
export const db = (uri: string) => record("db.connection", () => drizzle(uri));

/** Database instance type */
export type DB = ReturnType<typeof db>;
