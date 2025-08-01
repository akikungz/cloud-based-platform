import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { staff_list } from "../auth";
import { user } from "../auth/better_auth";
import { samester } from "./samester";

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

export const pve_node = pgTable("pve_node", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	status: node_status("status").notNull(),
	created_at: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updated_at: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_template = pgTable("instance_template", {
	id: text("id").primaryKey(),
	os_name: text("os_name").notNull(),
	vm_template_id: text("vm_template_id").notNull(),
	vm_template_host: text("vm_template_host").notNull(),
	vm_type: vm_type("vm_type").notNull(),
	created_at: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updated_at: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_course = pgTable("instance_course", {
	id: text("id").primaryKey(),
	course_id: text("course_id").notNull(),
	course_title: text("course_title").notNull(),
	course_staff: text("course_staff").references(() => staff_list.id, {
		onDelete: "cascade",
	}),
});

export const instance_request = pgTable("instance_request", {
	id: text("id").primaryKey(),
	// User fields
	user_id: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	// Basic fields
	title: text("title").notNull(),
	description: text("description").notNull(),
	type: instance_request_type("type").notNull(),
	course: text("course")
		.references(() => instance_course.id, { onDelete: "cascade" })
		.notNull(),
	// Instance fields
	template: text("template")
		.references(() => instance_template.id, { onDelete: "cascade" })
		.notNull(),
	cpus: integer("cpus").notNull(),
	memory: integer("memory").notNull(),
	disk: integer("disk").notNull(),
	// Request fields
	state: request_state("state").notNull().default("pending"),
	reason: text("reason"),
});

export const instance = pgTable("instance", {
	id: text("id").primaryKey(),
	// User fields
	user_id: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	// Basic fields
	title: text("title").notNull(),
	description: text("description").notNull(),
	type: instance_request_type("type").notNull(),
	course: text("course")
		.references(() => instance_course.id, { onDelete: "cascade" })
		.notNull(),
	samester: text("samester").references(() => samester.id, {
		onDelete: "cascade",
	}),
	// Instance fields
	template: text("template")
		.references(() => instance_template.id, { onDelete: "cascade" })
		.notNull(),
	cpus: integer("cpus").notNull(),
	memory: integer("memory").notNull(),
	disk: integer("disk").notNull(),
	state: instance_state("state").notNull().default("active"),
	status: instance_status("status").notNull().default("pending"),
	pve_node_id: text("pve_node_id").references(() => pve_node.id, {
		onDelete: "set null",
	}),
	vm_id: text("vm_id"),
	created_at: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updated_at: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_request_extends = pgTable("instance_request_extends", {
	id: text("id").primaryKey(),
	// instance fields
	instance_id: text("instance_id")
		.references(() => instance.id, { onDelete: "cascade" })
		.notNull(),
	// Basic fields
	title: text("title").notNull(),
	description: text("description").notNull(),
	// Request fields
	state: request_state("state").notNull().default("pending"),
	reason: text("reason"),
});
