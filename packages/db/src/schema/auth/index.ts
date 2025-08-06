import { sql } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./better_auth";

/**
 * Enum for staff roles.
 * This enum defines the different roles that a staff member can have.
 * - Administrator: Full access to all features.
 * - Teacher: Access to teaching-related features.
 * - Staff: General staff access.
 */
export const staff_role = pgEnum("staff_role", [
	"Administrator",
	"Teacher",
	"Staff",
]);

/**
 * Table for storing staff members.
 * Each staff member is associated with a user and has timestamps for creation, update, and deletion.
 */
export const staff_list = pgTable("staff_list", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	auth_id: text("auth_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	role: staff_role("role").default("Staff").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});

/**
 * Table for storing SSH public keys.
 *
 * Each key is associated with a user and has a comment for identification.
 */
export const ssh_public_keys = pgTable("ssh_public_keys", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	auth_id: text("auth_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	key: text("key").notNull(),
	comment: text("comment").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});
