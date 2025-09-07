import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./schema/**/*.{ts,js}",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://user:password@localhost:5433/postgres",
  }
});
