"use client";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { PageHeader, SectionCard, StatsCard } from "@midori/components/ui";
import { Database, Cpu, MemoryStick, HardDrive } from "lucide-react";

export default function InstancesPage() {
	return (
		<RoleGuard allowedRoles={[Role.Staff]}>
			<div className="flex flex-col items-center justify-center gap-4">
				<PageHeader
					title="Manage Instances"
					description="View and manage all virtual machine instances across the platform."
				/>

				<SectionCard
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
				</SectionCard>
			</div>
		</RoleGuard>
	);
}
