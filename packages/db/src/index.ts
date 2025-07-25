import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = (connectionString: string) =>
	new Pool({
		connectionString,
		keepAlive: true,
		max: 16, // Adjust based on your application's concurrency needs
	});

export const db = (database_url: string) => drizzle(pool(database_url));
