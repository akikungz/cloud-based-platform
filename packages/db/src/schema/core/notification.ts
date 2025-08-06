import { sql } from "drizzle-orm";
import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth/better_auth";

export const notification_type = pgEnum("notification_type", [
	"info",
	"warning",
	"error",
]);

/**
 * Notification table schema.
 * This table stores notifications for users, including the type, title, message,
 * read status, and timestamps for creation, update, and deletion.
 */
export const notification = pgTable("notification", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	user_id: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull(),
	message: text("message").notNull(),
	type: notification_type("type").notNull(),
	readed: boolean("readed").notNull(),
	created_at: timestamp("created_at").default(sql`now()`).notNull(),
	updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});
