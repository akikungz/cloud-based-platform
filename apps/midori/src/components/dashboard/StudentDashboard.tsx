"use client";
import { Database, Clock, CheckCircle, AlertCircle, Plus, Settings } from "lucide-react";
import TrendCard from "@midori/components/ui/TrendCard";
import { QuickActionCard } from "@midori/components/ui";
import { StudentRequestHistory } from "./StudentRequestHistory";
import { StudentInstancesList } from "@midori/components/dashboard/StudentInstancesList";
import { momoi_client } from "@midori/libs/momoi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
	const router = useRouter();
	const [stats, setStats] = useState({
		instances: 0,
		pendingRequests: 0,
		approvedRequests: 0,
		totalRequests: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// Fetch instances and requests in parallel
				const [instancesResult, requestsResult] = await Promise.all([
					momoi_client.api.v1.student.instances.get(),
					momoi_client.api.v1.student.requests.get()
				]);

				let instancesCount = 0;
				let pendingCount = 0;
				let approvedCount = 0;
				let totalCount = 0;

				if (!instancesResult.error && instancesResult.data) {
					// Handle the API response structure: { message: string, data: T }
					const instancesData = instancesResult.data?.data || instancesResult.data;
					instancesCount = Array.isArray(instancesData) ? instancesData.length : 0;
				}

				if (!requestsResult.error && requestsResult.data) {
					// Handle the API response structure: { message: string, data: T }
					const requestsData = requestsResult.data?.data || requestsResult.data;
					const requests = requestsData.requests || [];
					const extendRequests = requestsData.extend_requests || [];

					totalCount = requests.length + extendRequests.length;
					pendingCount = requests.filter((req: any) => req.state === 'pending').length;
					approvedCount = requests.filter((req: any) => req.state === 'approved').length;
				}

				setStats({
					instances: instancesCount,
					pendingRequests: pendingCount,
					approvedRequests: approvedCount,
					totalRequests: totalCount,
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
			{/* Header */}
			<div className="flex flex-col w-full px-2 pt-2">
				<h2 className="text-3xl font-semibold">Dashboard</h2>
				<p className="text-vm-blue-600">
					Manage your virtual machine instances and requests.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
				<TrendCard
					title="My Instances"
					value={loading ? "..." : stats.instances.toString()}
					icon={<Database className="w-4 h-4 text-vm-blue-600" />}
					className="bg-vm-blue-100"
				/>
				<TrendCard
					title="Pending Requests"
					value={loading ? "..." : stats.pendingRequests.toString()}
					icon={<Clock className="w-4 h-4 text-vm-orange-600" />}
					className="bg-vm-orange-100"
				/>
				<TrendCard
					title="Approved Requests"
					value={loading ? "..." : stats.approvedRequests.toString()}
					icon={<CheckCircle className="w-4 h-4 text-green-600" />}
					className="bg-green-100"
				/>
				<TrendCard
					title="Total Requests"
					value={loading ? "..." : stats.totalRequests.toString()}
					icon={<AlertCircle className="w-4 h-4 text-vm-blue-600" />}
					className="bg-vm-blue-100"
				/>
			</div>

			{/* Quick Actions */}
			{/* <div className="w-full bg-white p-8 rounded-lg shadow-md">
				<h3 className="text-xl font-semibold text-vm-blue-900 mb-4">
					Quick Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<QuickActionCard
						title="Request New Instance"
						description="Create a new virtual machine request"
						icon={<Plus className="w-5 h-5" />}
						onClick={() => router.push('/dashboard')}
					/>
					<QuickActionCard
						title="Manage Instances"
						description="View and manage your existing instances"
						icon={<Settings className="w-5 h-5" />}
						onClick={() => router.push('/instances/student')}
					/>
				</div>
			</div> */}

			{/* Request History */}
			<StudentRequestHistory maxItems={5} showOnlyRecent={true} />

			{/* Instances List */}
			<StudentInstancesList maxItems={3} showOnlyRecent={true} />
		</div>
	);
}
