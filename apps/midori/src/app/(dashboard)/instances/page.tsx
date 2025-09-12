"use client";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { PageHeader, SectionCard, StatsCard, Tabs } from "@midori/components/ui";
import { Database, Cpu, MemoryStick, HardDrive, User, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { StaffInstances } from "@midori/components/dashboard/StaffInstances";
import { CurrentStaffInstances } from "@midori/components/dashboard/CurrentStaffInstances";
import { CourseInstances } from "@midori/components/dashboard/CourseInstances";

export default function InstancesPage() {
	const tabs = [
		{
			id: "all-instances",
			label: "All Instances",
			content: (
				<div className="space-y-6">
					{/* <SectionCard
						title="Instance Management Dashboard"
						description="Monitor and manage all virtual machine instances, resource usage, and user allocations."
						className="p-8"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<StatsCard
								title="Total Instances"
								value="24"
								subtitle="Active VMs"
								icon={<Database className="w-4 h-4" />}
							/>

							<StatsCard
								title="Resource Usage"
								value="68%"
								subtitle="CPU Utilization"
								icon={<Cpu className="w-4 h-4" />}
							/>

							<StatsCard
								title="Memory Usage"
								value="45%"
								subtitle="RAM Utilization"
								icon={<MemoryStick className="w-4 h-4" />}
							/>

							<StatsCard
								title="Storage"
								value="2.1TB"
								subtitle="Used Storage"
								icon={<HardDrive className="w-4 h-4" />}
							/>
						</div>
					</SectionCard> */}
					<StaffInstances limit={20} />
				</div>
			)
		},
		{
			id: "my-instances",
			label: "My Instances",
			content: <CurrentStaffInstances limit={20} />
		},
		{
			id: "course-instances",
			label: "Course Instances",
			content: <CourseInstances limit={20} />
		}
	];

	return (
		<RoleGuard allowedRoles={[Role.Staff]}>
			<div className="flex flex-col items-center justify-center gap-4">
				<div className="flex items-center justify-between w-full">
					<PageHeader
						title="Manage Instances"
						description="View and manage all virtual machine instances across the platform."
					/>
					<Link
						href="/instances/staff/create"
						className="flex items-center space-x-2 bg-vm-blue-600 text-white px-4 py-2 rounded-md hover:bg-vm-blue-700 transition-colors min-w-40"
					>
						<Plus className="h-4 w-4" />
						<span className="text-sm">Create Instance</span>
					</Link>
				</div>

				<div className="w-full">
					<Tabs
						tabs={tabs}
						defaultTab="all-instances"
						className="w-full"
					/>
				</div>
			</div>
		</RoleGuard>
	);
}
