"use client";
import PendingRequest from "@midori/components/dashboard/PendingRequest";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { PageHeader } from "@midori/components/ui";

export default function ApprovalsPage() {
	return (
		<RoleGuard allowedRoles={[Role.Staff]}>
			<div className="flex flex-col items-center justify-center gap-4">
				<PageHeader
					title="Pending Approvals"
					description="Review and approve student requests for virtual machines."
				/>

				{/* Pending Requests */}
				<div className="w-full">
					<PendingRequest limit={10} />
				</div>
			</div>
		</RoleGuard>
	);
}
