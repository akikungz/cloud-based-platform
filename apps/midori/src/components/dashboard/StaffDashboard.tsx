"use client";
import { ClipboardList, Database, Users, Book } from "lucide-react";
import TrendCard from "@midori/components/ui/TrendCard";
import PendingRequest from "./PendingRequest";
import { StaffInstances } from "./StaffInstances";
import { PageHeader } from "@midori/components/ui";
import { env } from "@midori/libs/env";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
	const [stats, setStats] = useState({
		totalRequests: 0,
		activeInstances: 0,
		totalStudents: 0,
		activeCourses: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// Fetch approvals data
				const approvalsResponse = await fetch(`${env.API_URL}/api/v1/staff/approval?skip=1&take=100`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				// Fetch extends requests
				const extendsResponse = await fetch(`${env.API_URL}/api/v1/staff/approval/extends?skip=1&take=100`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				let totalRequests = 0;
				let activeInstances = 0;
				let totalStudents = 0;
				let activeCourses = 0;

				if (approvalsResponse.ok) {
					const approvalsData = await approvalsResponse.json();
					totalRequests = approvalsData.data?.count || 0;
					// Count unique students from requests
					const requests = approvalsData.data?.data || [];
					const uniqueStudents = new Set(requests.map((req: any) => req.user_id));
					totalStudents = uniqueStudents.size;
					
					// Count unique courses
					const uniqueCourses = new Set(requests.map((req: any) => req.course_id));
					activeCourses = uniqueCourses.size;
				}

				if (extendsResponse.ok) {
					const extendsData = await extendsResponse.json();
					totalRequests += extendsData.data?.count || 0;
				}

				// For now, we'll use placeholder values for active instances
				// This would require a separate API endpoint to get all instances
				activeInstances = Math.floor(totalRequests * 0.5); // Rough estimate

				setStats({
					totalRequests,
					activeInstances,
					totalStudents,
					activeCourses,
				});
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<PageHeader
				title="Dashboard"
				description="Monitor and manage student requests and approvals."
			/>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
				<TrendCard
					title="Total Requests"
					value={loading ? "..." : stats.totalRequests.toString()}
					icon={<ClipboardList className="w-4 h-4 text-vm-blue-600" />}
					className="bg-vm-blue-100"
				/>
				<TrendCard
					title="Active Instances"
					value={loading ? "..." : stats.activeInstances.toString()}
					icon={<Database className="w-4 h-4 text-vm-orange-600" />}
					className="bg-vm-orange-100"
				/>
				<TrendCard
					title="Total Students"
					value={loading ? "..." : stats.totalStudents.toString()}
					icon={<Users className="w-4 h-4 text-vm-blue-600" />}
					className="bg-vm-blue-100"
				/>
				<TrendCard
					title="Active Courses"
					value={loading ? "..." : stats.activeCourses.toString()}
					icon={<Book className="w-4 h-4 text-vm-orange-600" />}
					className="bg-vm-orange-100"
				/>
			</div>

			{/* Pending Requests */}
			<div className="w-full">
				<PendingRequest limit={3} dashboard />
			</div>

			{/* Recent Instances */}
			<div className="w-full">
				<StaffInstances limit={5} dashboard />
			</div>
		</div>
	);
}
