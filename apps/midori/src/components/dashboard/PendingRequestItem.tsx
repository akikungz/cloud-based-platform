"use client";
import { Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from "@mui/material";
import { Calendar, Clock, User, Book, Cpu, HardDrive, MemoryStick, Edit } from "lucide-react";
import { cn } from "@midori/utils/format";
import { SpecBadge } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { useState } from "react";
import { EditRequestDialog, type EditRequestData } from "./EditRequestDialog";

export interface PendingRequestItemProps {
	id: string;
	title: string;
	description: string;
	hostname?: string;
	requestedBy: {
		id: string;
		name: string;
		email: string;
	};
	course: {
		id: string;
		name: string;
		code: string;
	};
	spec: {
		os: string;
		cpu: number;
		memory: number;
		storage: number;
	};
	onRequestUpdate?: () => void;
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
	id,
	title,
	description,
	hostname,
	requestedBy,
	course,
	spec,
	onRequestUpdate,
}) => {
	const [isApproving, setIsApproving] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isApprovingFromEdit, setIsApprovingFromEdit] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
		open: false,
		message: "",
		severity: "success"
	});

	const handleApprove = async () => {
		setIsApproving(true);
		try {
			const result = await momoi_client.api.v1.staff.approval.approve.post({
				request_id: parseInt(id)
			});

			if (!result.error) {
				setSnackbar({
					open: true,
					message: "Request approved successfully",
					severity: "success"
				});
				// Trigger parent component refresh
				onRequestUpdate?.();
			} else {
				throw new Error(result.error.value.message || "Failed to approve request");
			}
		} catch (error) {
			console.error("Error approving request:", error);
			setSnackbar({
				open: true,
				message: error instanceof Error ? error.message : "Failed to approve request",
				severity: "error"
			});
		} finally {
			setIsApproving(false);
		}
	};

	const handleReject = async () => {
		if (!rejectReason.trim()) {
			setSnackbar({
				open: true,
				message: "Please provide a reason for rejection",
				severity: "error"
			});
			return;
		}

		setIsRejecting(true);
		try {
			const result = await momoi_client.api.v1.staff.approval.reject.post({
				request_id: parseInt(id),
				reason: rejectReason
			});

			if (!result.error) {
				setSnackbar({
					open: true,
					message: "Request rejected successfully",
					severity: "success"
				});
				setRejectDialogOpen(false);
				setRejectReason("");
				// Trigger parent component refresh
				onRequestUpdate?.();
			} else {
				throw new Error(result.error.value.message || "Failed to reject request");
			}
		} catch (error) {
			console.error("Error rejecting request:", error);
			setSnackbar({
				open: true,
				message: error instanceof Error ? error.message : "Failed to reject request",
				severity: "error"
			});
		} finally {
			setIsRejecting(false);
		}
	};

	const handleEdit = async (editData: EditRequestData) => {
		setIsEditing(true);
		try {
			const result = await momoi_client.api.v1.staff.approval.edit.put({
				request_id: parseInt(id),
				...editData
			});

			if (!result.error) {
				setSnackbar({
					open: true,
					message: "Request updated successfully",
					severity: "success"
				});
				setEditDialogOpen(false);
				// Trigger parent component refresh
				onRequestUpdate?.();
			} else {
				throw new Error(result.error.value.message || "Failed to update request");
			}
		} catch (error) {
			console.error("Error updating request:", error);
			setSnackbar({
				open: true,
				message: error instanceof Error ? error.message : "Failed to update request",
				severity: "error"
			});
		} finally {
			setIsEditing(false);
		}
	};

	const handleApproveFromEdit = async () => {
		setIsApprovingFromEdit(true);
		try {
			const result = await momoi_client.api.v1.staff.approval.approve.post({
				request_id: parseInt(id)
			});

			if (!result.error) {
				setSnackbar({
					open: true,
					message: "Request approved successfully",
					severity: "success"
				});
				setEditDialogOpen(false);
				// Trigger parent component refresh
				onRequestUpdate?.();
			} else {
				throw new Error(result.error.value.message || "Failed to approve request");
			}
		} catch (error) {
			console.error("Error approving request:", error);
			setSnackbar({
				open: true,
				message: error instanceof Error ? error.message : "Failed to approve request",
				severity: "error"
			});
		} finally {
			setIsApprovingFromEdit(false);
		}
	};
	return (
		<>
		{/* Backdrop overlay when modals are open */}
		{(rejectDialogOpen || editDialogOpen) && (
			<div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
		)}
		
		<div className={cn(
			"bg-white p-4 rounded-lg border border-vm-blue-200 hover:shadow-md transition-shadow",
			(rejectDialogOpen || editDialogOpen) && "opacity-50"
		)}>
			<div className="flex flex-col gap-3">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h4 className="text-lg font-semibold text-vm-blue-900 mb-1">
							{title}
						</h4>
						<p className="text-sm text-vm-blue-600 line-clamp-2">
							{description}
						</p>
					</div>
					<Chip
						label="Pending"
						color="warning"
						size="small"
						className="ml-2"
					/>
				</div>

				{/* Request Details */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{/* User Info */}
					<div className="flex items-center gap-2 text-sm">
						<User className="w-4 h-4 text-vm-blue-500" />
						<span className="text-vm-blue-700">
							{requestedBy.name} ({requestedBy.email})
						</span>
					</div>

					{/* Course Info */}
					<div className="flex items-center gap-2 text-sm">
						<Book className="w-4 h-4 text-vm-blue-500" />
						<span className="text-vm-blue-700">
							{course.name} ({course.code})
						</span>
					</div>
				</div>

				{/* Specs */}
				<div className="flex flex-wrap gap-2">
					<SpecBadge
						icon={Cpu}
						label={`${spec.cpu} CPU`}
						variant="blue"
					/>
					<SpecBadge
						icon={MemoryStick}
						label={`${spec.memory / 1024}GB RAM`}
						variant="blue"
					/>
					<SpecBadge
						icon={HardDrive}
						label={`${spec.storage}GB Storage`}
						variant="blue"
					/>
					<SpecBadge
						icon={Book}
						label={spec.os}
						variant="orange"
					/>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between pt-2 border-t border-vm-blue-100">
					<div className="flex items-center gap-2 text-xs text-vm-blue-500">
						<Clock className="w-3 h-3" />
						<span>Requested 2 hours ago</span>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outlined"
							color="primary"
							size="small"
							onClick={() => setEditDialogOpen(true)}
							disabled={isApproving || isRejecting || isEditing}
							startIcon={<Edit className="w-4 h-4" />}
						>
							Edit
						</Button>
						<Button
							variant="outlined"
							color="error"
							size="small"
							onClick={() => setRejectDialogOpen(true)}
							disabled={isApproving || isRejecting || isEditing}
						>
							{isRejecting ? "Rejecting..." : "Reject"}
						</Button>
						<Button
							variant="contained"
							color="success"
							size="small"
							onClick={handleApprove}
							disabled={isApproving || isRejecting || isEditing}
						>
							{isApproving ? "Approving..." : "Approve"}
						</Button>
					</div>
				</div>
			</div>
		</div>

		{/* Reject Dialog */}
		<Dialog 
			open={rejectDialogOpen} 
			onClose={() => setRejectDialogOpen(false)}
			sx={{ zIndex: 50 }}
		>
			<DialogTitle>Reject Request</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Reason for rejection"
					fullWidth
					multiline
					rows={3}
					value={rejectReason}
					onChange={(e) => setRejectReason(e.target.value)}
					placeholder="Please provide a reason for rejecting this request..."
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
				<Button 
					onClick={handleReject} 
					color="error"
					disabled={isRejecting}
				>
					{isRejecting ? "Rejecting..." : "Reject"}
				</Button>
			</DialogActions>
		</Dialog>

		{/* Edit Dialog */}
		<EditRequestDialog
			open={editDialogOpen}
			onClose={() => setEditDialogOpen(false)}
			onSave={handleEdit}
			onApprove={handleApproveFromEdit}
			initialData={{
				title,
				description,
				hostname: hostname || "vm-" + id,
				cpus: spec.cpu,
				memory: spec.memory,
				disk: spec.storage,
			}}
			loading={isEditing}
			approveLoading={isApprovingFromEdit}
		/>

		{/* Snackbar for notifications */}
		<Snackbar
			open={snackbar.open}
			autoHideDuration={6000}
			onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
		>
			<Alert 
				onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
				severity={snackbar.severity}
			>
				{snackbar.message}
			</Alert>
		</Snackbar>
	</>
	);
};

export const PendingRequestItemSkeleton: React.FC = () => {
	return (
		<div className="bg-white p-4 rounded-lg border border-vm-blue-200 animate-pulse">
			<div className="flex flex-col gap-3">
				{/* Header Skeleton */}
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="h-5 bg-vm-blue-200 rounded w-3/4 mb-2"></div>
						<div className="h-4 bg-vm-blue-200 rounded w-full mb-1"></div>
						<div className="h-4 bg-vm-blue-200 rounded w-2/3"></div>
					</div>
					<div className="h-6 bg-vm-orange-200 rounded w-16 ml-2"></div>
				</div>

				{/* Details Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="h-4 bg-vm-blue-200 rounded w-3/4"></div>
					<div className="h-4 bg-vm-blue-200 rounded w-3/4"></div>
				</div>

				{/* Specs Skeleton */}
				<div className="flex flex-wrap gap-2">
					<div className="h-6 bg-vm-blue-200 rounded w-16"></div>
					<div className="h-6 bg-vm-blue-200 rounded w-20"></div>
					<div className="h-6 bg-vm-blue-200 rounded w-18"></div>
					<div className="h-6 bg-vm-orange-200 rounded w-24"></div>
				</div>

				{/* Actions Skeleton */}
				<div className="flex items-center justify-between pt-2 border-t border-vm-blue-100">
					<div className="h-4 bg-vm-blue-200 rounded w-32"></div>
					<div className="flex gap-2">
						<div className="h-8 bg-vm-blue-200 rounded w-16"></div>
						<div className="h-8 bg-vm-blue-200 rounded w-20"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PendingRequestItem;
