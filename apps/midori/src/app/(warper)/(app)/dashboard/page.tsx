"use client";
import { UserContext } from "@midori/contexts/user";
import StaffDashboard from "@midori/pages/staff/Dashboard";
import StudentDashboard from "@midori/pages/student/Dashboard";
import { useContext } from "react";

export const Dashboard: React.FC = () => {
	const { user } = useContext(UserContext);

	if (!user) return null;

	return user.role === "Staff" ? <StaffDashboard /> : <StudentDashboard />;
};

export default Dashboard;
