"use client";
import { UserContext } from "@midori/contexts/user";
import { Role } from "auth/utils/role";
import { canAccessRoute, getDefaultRoute } from "@midori/config/routes";
import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AccessDenied from "@midori/components/layouts/AccessDenied";

interface RouteProtectionProps {
	children: React.ReactNode;
	requiredRole?: Role;
	allowedRoles?: Role[];
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
	children,
	requiredRole,
	allowedRoles,
}) => {
	const { user, isPending } = useContext(UserContext);
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		// Don't redirect while loading
		if (isPending) return;

		// If no user, redirect to sign-in
		if (!user) {
			router.push("/sign-in");
			return;
		}

		// Check if user can access the current route
		const canAccess = canAccessRoute(pathname, user.role);
		
		if (!canAccess) {
			// Redirect to default route for user's role
			const defaultRoute = getDefaultRoute(user.role);
			router.push(defaultRoute);
			return;
		}

		// Additional role checks if specified
		if (requiredRole && user.role !== requiredRole) {
			const defaultRoute = getDefaultRoute(user.role);
			router.push(defaultRoute);
			return;
		}

		if (allowedRoles && !allowedRoles.includes(user.role)) {
			const defaultRoute = getDefaultRoute(user.role);
			router.push(defaultRoute);
			return;
		}
	}, [user, isPending, pathname, router, requiredRole, allowedRoles]);

	// Show loading state while checking permissions
	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vm-blue-500"></div>
			</div>
		);
	}

	// If no user, don't render anything (will redirect)
	if (!user) {
		return null;
	}

	// Check if user can access the current route
	const canAccess = canAccessRoute(pathname, user.role);
	
	if (!canAccess) {
		return <AccessDenied />;
	}

	// Additional role checks if specified
	if (requiredRole && user.role !== requiredRole) {
		return <AccessDenied />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <AccessDenied />;
	}

	// User has access, render children
	return <>{children}</>;
};

export default RouteProtection;
