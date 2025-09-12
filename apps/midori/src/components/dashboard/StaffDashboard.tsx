"use client";
import { ClipboardList, Database, Users, Book, Plus, RefreshCw } from "lucide-react";
import TrendCard from "@midori/components/ui/TrendCard";
import { CoursesCard } from "@midori/components/ui";
import PendingRequest from "./PendingRequest";
import { StaffInstances } from "./StaffInstances";
import { PageHeader } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StaffDashboard() {
	const [stats, setStats] = useState({
		totalRequests: 0,
		activeInstances: 0,
		totalStudents: 0,
	});
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [coursesLoading, setCoursesLoading] = useState(true);

	const fetchDashboardData = async (isRefresh = false) => {
		try {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			// Fetch all data in parallel for better performance using momoi client
			const [approvalsResult, extendsResult, instancesResult, coursesResult] = await Promise.all([
				// Fetch approvals data
				momoi_client.api.v1.staff.approval.get({
					query: { skip: 1, take: 100 }
				}),
				// Fetch extends requests
				momoi_client.api.v1.staff.approval.extends.get({
					query: { skip: 1, take: 100 }
				}),
				// Fetch instances stats
				momoi_client.api.v1.staff.instances.stats.get(),
				// Fetch courses data
				momoi_client.api.v1.staff.course.get()
			]);

				let totalRequests = 0;
				let activeInstances = 0;
				let totalStudents = 0;

			// Process approvals data
			if (!approvalsResult.error) {
				totalRequests = approvalsResult.data?.data?.count || 0;
			}

			// Process extends data
			if (!extendsResult.error) {
				totalRequests += extendsResult.data?.data?.count || 0;
			}

			// Process instances stats
			if (!instancesResult.error) {
				activeInstances = instancesResult.data?.data?.running || 0;
			}

			// Process courses data
			if (!coursesResult.error) {
				setCourses(coursesResult.data?.data || []);
			}

			// Fetch instances data to calculate unique students and courses
			const instancesListResult = await momoi_client.api.v1.staff.instances.get({
				query: { skip: 0, take: 1000 }
			});

			if (!instancesListResult.error) {
				const instances = instancesListResult.data?.data?.instances || [];
				
				// Count unique students from instances
				const uniqueStudents = new Set(instances.map((instance: any) => instance.user?.id).filter(Boolean));
				totalStudents = uniqueStudents.size;
			}

				setStats({
					totalRequests,
					activeInstances,
					totalStudents,
				});
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				// Set default values on error
				setStats({
					totalRequests: 0,
					activeInstances: 0,
					totalStudents: 0,
				});
				setCourses([]);
		} finally {
			if (isRefresh) {
				setRefreshing(false);
			} else {
				setLoading(false);
			}
			setCoursesLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const handleRefresh = () => {
		fetchDashboardData(true);
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="flex items-center justify-between w-full">
				<PageHeader
					title="Dashboard"
					description="Monitor and manage student requests and approvals."
				/>
				<div className="flex items-center space-x-3">
					<button
						onClick={handleRefresh}
						disabled={refreshing}
						className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
						<span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
					</button>
					<Link
						href="/instances/staff/create"
						className="flex items-center space-x-2 bg-vm-blue-600 text-white px-4 py-2 rounded-md hover:bg-vm-blue-700 transition-colors min-w-40"
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm">Create Instance</span>
					</Link>
				</div>
			</div>

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
				<CoursesCard
					title="Courses"
					courses={courses}
					loading={coursesLoading}
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
