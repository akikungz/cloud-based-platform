"use client";
import PendingRequest from "@midori/components/ui/dashboard/PendingRequest";
import { PendingItemProvider } from "@midori/contexts/staff/pendingItem";

export const Dashboard: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			{/* Header */}
			<div className="flex flex-col w-full px-2 pt-2">
				<h2 className="text-3xl font-semibold">
					Dashboard
				</h2>
				<p className="text-vm-blue-600">
					Monitor and manage student requests and approvals.
				</p>
			</div>

			{/* Pending Requests */}
			<PendingItemProvider>
				<PendingRequest limit={3} dashboard />
			</PendingItemProvider>
		</div>
	);
};

export default Dashboard;
