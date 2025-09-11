"use client";
import { 
	PageHeader, 
	SectionCard, 
	StatsCard, 
	QuickActionCard, 
	SpecBadge, 
	EmptyState,
	TrendCard 
} from "@midori/components/ui";
import { 
	Database, 
	Cpu, 
	MemoryStick, 
	HardDrive, 
	Plus, 
	Settings, 
	Users, 
	Book,
	SearchX,
	AlertCircle
} from "lucide-react";

/**
 * Example component demonstrating the usage of all reusable UI components
 * This serves as documentation and a reference for developers
 */
export const ReusableComponentsExample: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-6 p-4">
			{/* Page Header Example */}
			<PageHeader
				title="Reusable Components Demo"
				description="This page demonstrates all the reusable UI components available in the system."
			/>

			{/* Stats Cards Example */}
			<SectionCard
				title="Stats Cards"
				description="Display key metrics and statistics"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatsCard
						title="Total Users"
						value="1,234"
						subtitle="Active users"
						icon={<Users className="w-4 h-4" />}
					/>
					<StatsCard
						title="CPU Usage"
						value="68%"
						subtitle="Average utilization"
						icon={<Cpu className="w-4 h-4" />}
					/>
					<StatsCard
						title="Memory"
						value="4.2GB"
						subtitle="Used memory"
						icon={<MemoryStick className="w-4 h-4" />}
					/>
					<StatsCard
						title="Storage"
						value="2.1TB"
						subtitle="Total storage"
						icon={<HardDrive className="w-4 h-4" />}
					/>
				</div>
			</SectionCard>

			{/* Trend Cards Example */}
			<SectionCard
				title="Trend Cards"
				description="Enhanced cards with trend indicators"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<TrendCard
						title="Active Instances"
						value="24"
						icon={<Database className="w-4 h-4 text-vm-blue-600" />}
						className="bg-vm-blue-100"
					/>
					<TrendCard
						title="Pending Requests"
						value="8"
						icon={<AlertCircle className="w-4 h-4 text-vm-orange-600" />}
						className="bg-vm-orange-100"
					/>
					<TrendCard
						title="Total Courses"
						value="12"
						icon={<Book className="w-4 h-4 text-green-600" />}
						className="bg-green-100"
					/>
				</div>
			</SectionCard>

			{/* Quick Action Cards Example */}
			<SectionCard
				title="Quick Actions"
				description="Interactive action cards for common tasks"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<QuickActionCard
						title="Create New Instance"
						description="Set up a new virtual machine instance"
						icon={<Plus className="w-5 h-5" />}
						onClick={() => console.log("Create instance clicked")}
					/>
					<QuickActionCard
						title="Manage Settings"
						description="Configure system and user preferences"
						icon={<Settings className="w-5 h-5" />}
						onClick={() => console.log("Settings clicked")}
					/>
					<QuickActionCard
						title="View Reports"
						description="Access detailed analytics and reports"
						icon={<Database className="w-5 h-5" />}
						onClick={() => console.log("Reports clicked")}
					/>
				</div>
			</SectionCard>

			{/* Spec Badges Example */}
			<SectionCard
				title="Specification Badges"
				description="Display technical specifications and metadata"
			>
				<div className="flex flex-wrap gap-3">
					<SpecBadge
						icon={Cpu}
						label="4 CPU Cores"
						variant="blue"
					/>
					<SpecBadge
						icon={MemoryStick}
						label="8GB RAM"
						variant="blue"
					/>
					<SpecBadge
						icon={HardDrive}
						label="100GB SSD"
						variant="blue"
					/>
					<SpecBadge
						icon={Book}
						label="Ubuntu 22.04"
						variant="orange"
					/>
					<SpecBadge
						icon={Users}
						label="Active"
						variant="green"
					/>
					<SpecBadge
						icon={AlertCircle}
						label="Maintenance"
						variant="gray"
					/>
				</div>
			</SectionCard>

			{/* Empty State Example */}
			<SectionCard
				title="Empty States"
				description="Display when no data is available"
			>
				<div className="h-64">
					<EmptyState
						icon={SearchX}
						title="No results found"
						description="Try adjusting your search criteria or filters to find what you're looking for."
					/>
				</div>
			</SectionCard>

			{/* Combined Example */}
			<SectionCard
				title="Combined Usage Example"
				description="Real-world example combining multiple components"
			>
				<div className="space-y-4">
					{/* Stats row */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<StatsCard
							title="Instance Status"
							value="Running"
							subtitle="All systems operational"
							icon={<Database className="w-4 h-4" />}
						/>
						<StatsCard
							title="Resource Usage"
							value="45%"
							subtitle="CPU utilization"
							icon={<Cpu className="w-4 h-4" />}
						/>
						<StatsCard
							title="Storage Used"
							value="1.2TB"
							subtitle="of 5TB total"
							icon={<HardDrive className="w-4 h-4" />}
						/>
					</div>

					{/* Specs */}
					<div className="flex flex-wrap gap-2">
						<SpecBadge icon={Cpu} label="2 vCPU" variant="blue" />
						<SpecBadge icon={MemoryStick} label="4GB RAM" variant="blue" />
						<SpecBadge icon={HardDrive} label="50GB Storage" variant="blue" />
						<SpecBadge icon={Book} label="Ubuntu 20.04" variant="orange" />
					</div>

					{/* Actions */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<QuickActionCard
							title="Restart Instance"
							description="Restart the virtual machine"
							icon={<Settings className="w-5 h-5" />}
						/>
						<QuickActionCard
							title="View Logs"
							description="Access system and application logs"
							icon={<Database className="w-5 h-5" />}
						/>
					</div>
				</div>
			</SectionCard>
		</div>
	);
};

export default ReusableComponentsExample;
