import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const samester = pgTable("samester", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull().unique(),
	start_at: timestamp("start_at").notNull(),
	end_at: timestamp("end_at").notNull(),
	created_at: timestamp("created_at").default(sql`now()`).notNull(),
	updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});
