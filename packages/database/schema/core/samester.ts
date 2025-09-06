import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Samester table schema.
 * This table stores information about academic semesters, including the name,
 * start and end dates, and timestamps for creation, update, and deletion.
 */
export const samester = pgTable("samester", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  start_at: timestamp("start_at").notNull(),
  end_at: timestamp("end_at").notNull(),
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
  deleted_at: timestamp("deleted_at"),
});
