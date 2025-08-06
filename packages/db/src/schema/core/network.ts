import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Network Schema.
 *
 * This schema is for manage network interface by interface name in PVE.
 */
export const network = pgTable("network", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: text("name").notNull(),
	network: text("network").notNull(),
	gateway: text("gateway").notNull(),
	created_at: timestamp("created_at").default(sql`now()`).notNull(),
	updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});

/**
 * IP Address Schema.
 *
 * This schema is for available ip address to use by instance.
 */
export const ip_address = pgTable("ip_address", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	network: uuid("network")
		.references(() => network.id, { onDelete: "cascade" })
		.notNull(),
	ip: text("ip").unique().notNull(),
	is_used: boolean("is_used").default(false).notNull(),
	created_at: timestamp("created_at").default(sql`now()`).notNull(),
	updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
	deleted_at: timestamp("deleted_at"),
});
