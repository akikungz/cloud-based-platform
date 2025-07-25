import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const instance_status = pgEnum("instance_status", [
	"pending",
	"running",
	"stopped",
	"terminated",
]);

export const instance_host_status = pgEnum("instance_host_status", [
	"active",
	"inactive",
	"maintenance",
]);

export const instance_request_status = pgEnum("instance_request_status", [
	"pending",
	"approved",
	"rejected",
	"cancelled",
]);

export const instance = pgTable("instance", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	vmid: integer("vmid").notNull(),
	requestId: integer("request_id").references(() => instance_request.id, {
		onDelete: "cascade",
	}),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	ipAddress: text("ip_address").notNull(),
	status: instance_status("status")
		.notNull()
		.$defaultFn(() => "pending"),
	host: integer("host")
		.notNull()
		.references(() => instance_host.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_request = pgTable("instance_request", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description").notNull(),
	templateId: integer("template_id")
		.notNull()
		.references(() => instance_template.id, { onDelete: "cascade" }),
	status: instance_request_status("status")
		.notNull()
		.$defaultFn(() => "pending"),
	reason: text("reason"), // Reason for rejection, nullable
	approvedBy: text("approved_by").references(() => user.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_template = pgTable("instance_template", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	vmid: integer("vmid").notNull(),
	vCpu: integer("v_cpu").notNull(),
	memory: integer("memory").notNull(), // in MB
	disk: integer("disk").notNull(), // in GB
	os: text("os").notNull(),
	host: integer("host")
		.notNull()
		.references(() => instance_host.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const instance_host = pgTable("instance_host", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	hostname: text("hostname").notNull(),
	ipAddress: text("ip_address").notNull(),
	cpu: integer("cpu").notNull(),
	memory: integer("memory").notNull(), // in MB
	disk: integer("disk").notNull(), // in GB
	status: instance_host_status("status")
		.notNull()
		.$defaultFn(() => "active"),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});
