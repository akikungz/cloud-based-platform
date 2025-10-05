import { Role } from "auth/utils/role";

export interface RouteConfig {
	path: string;
	allowedRoles: Role[];
	title: string;
	description?: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
	"/dashboard": {
		path: "/dashboard",
		allowedRoles: [Role.Staff, Role.Student],
		title: "Dashboard",
		description: "Main dashboard for users",
	},
	"/approvals": {
		path: "/approvals",
		allowedRoles: [Role.Staff],
		title: "Pending Approvals",
		description: "Review and approve student requests",
	},
	"/instances": {
		path: "/instances",
		allowedRoles: [Role.Staff],
		title: "Manage Instances",
		description: "View and manage all virtual machine instances",
	},
	"/instances/[id]": {
		path: "/instances/[id]",
		allowedRoles: [Role.Staff, Role.Student],
		title: "Instance Details",
		description: "View detailed information about a specific instance",
	},
	"/instances/staff/create": {
		path: "/instances/staff/create",
		allowedRoles: [Role.Staff],
		title: "Create Instance",
		description: "Create virtual machine instances directly without requiring student requests or semester locks",
	},
	"/instances/student": {
		path: "/instances/student",
		allowedRoles: [Role.Student],
		title: "My Instances",
		description: "View and manage your virtual machine instances",
	},
	"/requests": {
		path: "/requests",
		allowedRoles: [Role.Student],
		title: "My Requests",
		description: "View and manage your instance requests",
	},
	"/instances/[id]": {
		path: "/instances/[id]",
		allowedRoles: [Role.Student],
		title: "Instance Details",
		description: "View detailed information about a specific instance",
	},
	"/settings": {
		path: "/settings",
		allowedRoles: [Role.Staff, Role.Student],
		title: "Settings",
		description: "Manage your account settings and preferences",
	},
	"/storage": {
		path: "/storage",
		allowedRoles: [Role.Staff],
		title: "Storage",
		description: "Manage storage resources",
	},
	"/semesters": {
		path: "/semesters",
		allowedRoles: [Role.Staff],
		title: "Semesters",
		description: "Manage academic semesters",
	},
	"/courses": {
		path: "/courses",
		allowedRoles: [Role.Staff],
		title: "Courses",
		description: "Manage course information",
	},
	"/staff": {
		path: "/staff",
		allowedRoles: [Role.Staff],
		title: "Staff Management",
		description: "Manage staff members",
	},
};

/**
 * Check if a user with the given role can access a specific route
 * @param path - The route path to check
 * @param userRole - The user's role
 * @returns boolean indicating if access is allowed
 */
export function canAccessRoute(path: string, userRole: Role): boolean {
	const routeConfig = ROUTE_CONFIG[path];
	if (!routeConfig) {
		// If route is not configured, deny access by default
		return false;
	}
	return routeConfig.allowedRoles.includes(userRole);
}

/**
 * Get all routes that a user with the given role can access
 * @param userRole - The user's role
 * @returns Array of route configurations the user can access
 */
export function getAccessibleRoutes(userRole: Role): RouteConfig[] {
	return Object.values(ROUTE_CONFIG).filter(route =>
		route.allowedRoles.includes(userRole)
	);
}

/**
 * Get the default route for a user based on their role
 * @param userRole - The user's role
 * @returns The default route path
 */
export function getDefaultRoute(userRole: Role): string {
	switch (userRole) {
		case Role.Staff:
			return "/dashboard";
		case Role.Student:
			return "/dashboard";
		default:
			return "/";
	}
}
