import type { User } from "./user";

export enum notification_type {
	INFO = "info",
	WARNING = "warning",
	ERROR = "error",
}

export interface Notification {
	id: string;
	user_id: User["id"];
	title: string;
	message: string;
	type: notification_type;
	readed: boolean;
}
