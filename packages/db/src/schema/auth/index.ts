import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./better_auth";

/**
 * Table for storing staff members.
 * Each staff member is associated with a user and has timestamps for creation, update, and deletion.
 */
export const staff_list = pgTable("staff_list", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	auth_id: text("auth_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});
