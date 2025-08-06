import type { Samester } from "./samester";
import type { Staff, User } from "./user";

export enum instance_state {
	ACTIVE = "active",
	DELETED = "deleted",
	ARCHIVED = "archived",
}

export enum instance_status {
	PENDING = "pending",
	RUNNING = "running",
	STOPPED = "stopped",
}

export enum instance_request_type {
	COURSE = "course",
	PROJECT = "project",
}

export enum request_state {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
	CANCELLED = "cancelled",
}

export enum vm_type {
	QEMU = "qemu",
	LXC = "lxc",
}

export enum node_status {
	ONLINE = "online",
	OFFLINE = "offline",
	MAINTENANCE = "maintenance",
	UNKNOWN = "unknown",
}

export interface InstanceSpec {
	template: InstanceTemplate["id"];
	cpus: number;
	memory: number;
	disk: number;
}

export interface BaseInstanceInfo {
	title: string;
	hostname: string;
	description: string;
	type: instance_request_type;
	course: InstanceCourse["id"];
}

export type PveNode = {
	id: string;
	name: string;
	status: node_status;
	created_at: Date;
	updated_at: Date;
};

export type InstanceTemplate = {
	id: string;
	os_name: string;
	vm_template_id: string;
	vm_template_host: PveNode["name"];
	vm_type: vm_type;
	created_at: Date;
	updated_at: Date;
};

export type InstanceCourse = {
	id: string;
	course_id: string;
	course_title: string;
	main_staff: Staff["id"];
	assistant_staff_1: Staff["id"] | null;
	assistant_staff_2: Staff["id"] | null;
	assistant_staff_3: Staff["id"] | null;
	created_at: Date;
	updated_at: Date;
};

export type InstanceRequest = {
	id: string;
	user_id: User["id"];
	state: request_state;
	reason: string | null;
	created_at: Date;
	updated_at: Date;
} & InstanceSpec &
	BaseInstanceInfo;

export type Instance = {
	id: string;
	user: User["id"];
	state: instance_state;
	status: instance_status;
	samester: Samester["id"];
	pve_node: PveNode["id"];
	vm_id: string;
} & InstanceSpec &
	BaseInstanceInfo;

export type InstanceRequestExtended = {
	id: string;
	instance: InstanceRequest;
	title: string;
	description: string;
	state: request_state;
	reason: string | null;
};
