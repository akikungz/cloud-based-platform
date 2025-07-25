import { env } from "@momoi/libs/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./src/drizzle",
	schema: "./src/schema/*.{ts,js}",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
