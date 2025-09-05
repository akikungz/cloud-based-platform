import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { staff_list } from "database/schema/auth/user";
import { user } from "database/schema/auth/better-auth";
import { ip_address } from "database/schema/core/network";
import { samester } from "database/schema/core/samester";

export const instance_state = pgEnum("instance_state", [
  "active",
  "deleted",
  "archived",
]);

export const instance_status = pgEnum("instance_status", [
  "pending",
  "running",
  "stopped",
]);

export const instance_request_type = pgEnum("instance_request_type", [
  "course",
  "project",
]);

export const request_state = pgEnum("request_state", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const vm_type = pgEnum("vm_type", ["qemu", "lxc"]);

export const node_status = pgEnum("node_status", [
  "online",
  "offline",
  "maintenance",
  "unknown",
]);

/**
 * PVE (Proxmox Virtual Environment) database schema.
 * This schema defines the structure for managing PVE nodes, instances, and related data.
 */
export const pve_node = pgTable("pve_node", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: node_status("status").notNull(),
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * PVE Instance Template schema.
 * This schema defines the structure for managing instance templates in PVE.
 */
export const instance_template = pgTable("instance_template", {
  id: serial("id").primaryKey(),
  os_name: text("os_name").notNull(),
  vm_template_id: text("vm_template_id").notNull(),
  vm_template_host: text("vm_template_host")
    .references(() => pve_node.name, { onDelete: "cascade" })
    .notNull(),
  vm_type: vm_type("vm_type").notNull(),
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Instance Course schema.
 * This schema defines the structure for managing courses associated with instances.
 * It includes references to staff members and course details.
 */
export const instance_course = pgTable("instance_course", {
  id: serial("id").primaryKey(),
  course_id: text("course_id").notNull(),
  course_title: text("course_title").notNull(),
  main_staff: integer("main_staff")
    .references(() => staff_list.id, {
      onDelete: "cascade",
    })
    .notNull(),
  assistant_staff_1: integer("assistant_staff_1").references(() => staff_list.id, {
    onDelete: "cascade",
  }),
  assistant_staff_2: integer("assistant_staff_2").references(() => staff_list.id, {
    onDelete: "cascade",
  }),
  assistant_staff_3: integer("assistant_staff_3").references(() => staff_list.id, {
    onDelete: "cascade",
  }),
  // Timestamps
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Instance Request schema.
 * This schema defines the structure for managing instance requests made by users.
 * It includes fields for user information, instance details, and request status.
 */
export const instance_request = pgTable("instance_request", {
  id: serial("id").primaryKey(),
  // User fields
  user: text("user")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  // Basic fields
  title: text("title").notNull(),
  hostname: text("hostname").notNull(),
  description: text("description").notNull(),
  type: instance_request_type("type").notNull(),
  course: integer("course")
    .references(() => instance_course.id, { onDelete: "cascade" })
    .notNull(),
  // Instance fields
  template: integer("template")
    .references(() => instance_template.id, { onDelete: "cascade" })
    .notNull(),
  cpus: integer("cpus").notNull(),
  memory: integer("memory").notNull(),
  disk: integer("disk").notNull(),
  // Request fields
  state: request_state("state").notNull().default("pending"),
  reason: text("reason"),
  // Timestamps
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
});

/**
 * Instance schema.
 *
 * This schema defines the structure for managing instances in the PVE.
 * It includes fields for user information, instance details, and PVE-specific configurations.
 */
export const instance = pgTable("instance", {
  id: serial("id").primaryKey(),
  // User fields
  user: text("user")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  // Basic fields
  title: text("title").notNull(),
  hostname: text("hostname").notNull(),
  description: text("description").notNull(),
  type: instance_request_type("type").notNull(),
  course: integer("course")
    .references(() => instance_course.id, { onDelete: "cascade" })
    .notNull(),
  samester: integer("samester").references(() => samester.id, {
    onDelete: "cascade",
  }),
  // Instance fields
  template: integer("template")
    .references(() => instance_template.id, { onDelete: "cascade" })
    .notNull(),
  cpus: integer("cpus").notNull(),
  memory: integer("memory").notNull(),
  disk: integer("disk").notNull(),
  state: instance_state("state").notNull().default("active"),
  status: instance_status("status").notNull().default("pending"),
  pve_node: text("pve_node")
    .references(() => pve_node.name, {
      onDelete: "cascade",
    })
    .notNull(),
  vm_id: integer("vm_id").notNull(),
  ip_address: text("ip_address")
    .references(() => ip_address.ip, {
      onDelete: "cascade",
    })
    .unique(),
  created_at: timestamp("created_at").default(sql`now()`).notNull(),
  updated_at: timestamp("updated_at").default(sql`now()`).notNull(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Instance Request Extends schema.
 * This schema extends the instance request with additional fields for more detailed requests.
 * It includes fields for the instance, request title, description, state, and reason.
 */
export const instance_request_extends = pgTable("instance_request_extends", {
  id: serial("id").primaryKey(),
  // instance fields
  instance: integer("instance")
    .references(() => instance.id, { onDelete: "cascade" })
    .notNull(),
  // Basic fields
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Request fields
  state: request_state("state").notNull().default("pending"),
  reason: text("reason"),
  // Timestamps
  created_at: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updated_at: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});
