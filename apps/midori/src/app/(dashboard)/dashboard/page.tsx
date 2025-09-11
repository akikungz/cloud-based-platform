"use client";
import { UserContext } from "@midori/contexts/user";
import { useContext } from "react";
import { Role } from "auth/utils/role";
import StaffDashboard from "@midori/components/dashboard/StaffDashboard";
import StudentDashboard from "@midori/components/dashboard/StudentDashboard";

export default function DashboardPage() {
	const { user } = useContext(UserContext);

	if (!user) {
		return <div>Loading...</div>;
	}

	// Render different dashboard based on user role
	if (user.role === Role.Staff) {
		return <StaffDashboard />;
	}

	return <StudentDashboard />;
}