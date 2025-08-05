"use client";
import PendingRequest from "@midori/components/ui/dashboard/PendingRequest";

export const Dashboard: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center">
			{/* Header */}
			<div className="flex items-center justify-between w-full">
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
			<PendingRequest limit={3} />
		</div>
	);
};

export default Dashboard;
