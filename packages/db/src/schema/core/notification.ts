import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/better_auth";

export const notification_type = pgEnum("notification_type", [
	"info",
	"warning",
	"error",
]);

export const notification = pgTable("notification", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	title: text("title").notNull(),
	message: text("message").notNull(),
	type: notification_type("type").notNull(),
	readed: boolean("readed").notNull(),
	read_at: timestamp("read_at"),
	created_at: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updated_at: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});
