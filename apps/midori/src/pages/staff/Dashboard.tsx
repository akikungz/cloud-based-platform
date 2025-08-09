"use client";
import PendingRequest from "@midori/components/ui/dashboard/PendingRequest";
import { PendingItemProvider } from "@midori/contexts/staff/pendingItem";

export const Dashboard: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			{/* Header */}
			<div className="flex items-center justify-between w-full px-2 pt-2">
				<div className="flex flex-col">
					<h2 className="text-3xl font-semibold">
						Instant Management Dashboard
					</h2>
					<p className="text-vm-blue-600">
						Manage your virtual machines and resources efficiently.
					</p>
				</div>
			</div>

			{/* Pending Requests */}
			<PendingItemProvider>
				<PendingRequest limit={3} dashboard />
			</PendingItemProvider>
		</div>
	);
};

export default Dashboard;
