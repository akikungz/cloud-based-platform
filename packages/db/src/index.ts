import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Creates a PostgreSQL connection pool.
 * @param connectionString - The connection string for the PostgreSQL database.
 * @returns A PostgreSQL connection pool.
 */
export const pool = (connectionString: string) =>
	new Pool({
		connectionString,
		keepAlive: true,
		max: 16, // Adjust based on your application's concurrency needs
	});

/**
 * Creates a Drizzle ORM instance with a PostgreSQL connection pool.
 * @param database_url - The connection string for the PostgreSQL database.
 * @returns A Drizzle ORM instance connected to the specified PostgreSQL database.
 */
export const db = (database_url: string) => drizzle(pool(database_url));
