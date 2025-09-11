/**
 * Navigation utility functions for determining active states and route matching
 */

import { Role } from "auth/utils/role";

/**
 * Determines if a menu item should be marked as active based on the current pathname
 * @param itemHref - The href of the menu item
 * @param currentPathname - The current pathname from usePathname()
 * @param userRole - The user's role (optional)
 * @returns boolean indicating if the item should be active
 */
export function isMenuItemActive(itemHref: string, currentPathname: string, userRole?: Role): boolean {
	// Exact match
	if (currentPathname === itemHref) return true;
	
	// Handle dashboard routes - match both /dashboard and /dashboard/dashboard
	if (itemHref === "/dashboard" && 
		(currentPathname === "/dashboard" || currentPathname.startsWith("/dashboard/"))) return true;
	
	// Handle instance routes - match both /instance and /instances
	if ((itemHref === "/instance" || itemHref === "/instances") && 
		(currentPathname.startsWith("/instance"))) return true;
	
	// Handle student instances route
	if (itemHref === "/instances" && userRole === Role.Student && 
		currentPathname === "/instances/student") return true;
	
	// Handle other nested routes
	if (itemHref !== "/dashboard" && currentPathname.startsWith(itemHref + "/")) return true;
	
	return false;
}

/**
 * Gets the appropriate href for a menu item, handling redirects and role-based routing
 * @param itemHref - The original href
 * @param userRole - The user's role
 * @returns The actual href to use
 */
export function getMenuItemHref(itemHref: string, userRole?: Role): string {
	// Handle redirects
	if (itemHref === "/instance") return "/instances";
	
	// Role-based routing for instances
	if (itemHref === "/instances" && userRole === Role.Student) {
		return "/instances/student";
	}
	
	return itemHref;
}
