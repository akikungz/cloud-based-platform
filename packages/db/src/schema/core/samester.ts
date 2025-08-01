import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const samester = pgTable("samester", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	start_at: timestamp("start_at").notNull(),
	end_at: timestamp("end_at").notNull(),
	created_at: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updated_at: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});
