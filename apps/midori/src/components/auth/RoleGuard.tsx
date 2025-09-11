"use client";
import { UserContext } from "@midori/contexts/user";
import { Role } from "auth/utils/role";
import { useContext } from "react";
import AccessDenied from "@midori/components/layouts/AccessDenied";

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles: Role[];
	fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
	children,
	allowedRoles,
	fallback = <AccessDenied />,
}) => {
	const { user, isPending } = useContext(UserContext);

	// Show loading state while user data is being fetched
	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vm-blue-500"></div>
			</div>
		);
	}

	// If no user or user role is not in allowed roles, show fallback
	if (!user || !allowedRoles.includes(user.role)) {
		return <>{fallback}</>;
	}

	// User has appropriate role, render children
	return <>{children}</>;
};

export default RoleGuard;
