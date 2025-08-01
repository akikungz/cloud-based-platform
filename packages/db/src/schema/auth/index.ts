import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./better_auth";

export const staff_list = pgTable("staff_list", {
	id: text("id").primaryKey(),
	auth_id: text("auth_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});
