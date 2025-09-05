import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./better-auth";

/** Staff list to filter staff is in it department */
export const staff_list = pgTable("staff_list", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  created_at: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updated_at: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
  deleted_at: timestamp("deleted_at")
});

export const user_public_key = pgTable("user_public_key", {
  id: serial("id").primaryKey(),
  user_id: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  public_key: text("public_key").notNull(),
  created_at: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  deleted_at: timestamp("deleted_at"),
});
