"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@midori/components/ui";
import { Button } from "@mui/material";
import { Check, X, ClipboardList, User, Calendar, FileText, AlertCircle, Cpu, MemoryStick, HardDrive, Edit } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { formatDate } from "@midori/utils/format";
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
	created_at?: Date;
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
	created_at,
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
			<Card className="w-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
								<ClipboardList className="h-5 w-5 text-blue-500" />
								{title}
							</CardTitle>
							<p className="text-sm text-gray-600 mt-1">
								VM instance request for {course.name}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
								Pending Request
							</span>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="space-y-4">
						{/* Description */}
						<div className="flex items-start gap-3">
							<FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
							<div className="flex-1">
								<p className="text-sm text-gray-700">{description}</p>
							</div>
						</div>

						{/* Hostname */}
						{hostname && (
							<div className="flex items-center gap-3">
								<AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
								<div className="flex-1">
									<p className="text-sm text-gray-600">
										<span className="font-medium">Hostname:</span> {hostname}
									</p>
								</div>
							</div>
						)}

						{/* Specifications */}
						<div className="flex items-start gap-3">
							<Cpu className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
							<div className="flex-1">
								<div className="flex flex-wrap gap-4">
									<div className="flex items-center gap-2">
										<Cpu className="h-3 w-3 text-gray-400" />
										<span className="text-sm text-gray-600">{spec.cpu} CPU</span>
									</div>
									<div className="flex items-center gap-2">
										<MemoryStick className="h-3 w-3 text-gray-400" />
										<span className="text-sm text-gray-600">{spec.memory / 1024}GB RAM</span>
									</div>
									<div className="flex items-center gap-2">
										<HardDrive className="h-3 w-3 text-gray-400" />
										<span className="text-sm text-gray-600">{spec.storage}GB Storage</span>
									</div>
								</div>
							</div>
						</div>

						{/* Requested By */}
						<div className="flex items-center gap-3">
							<User className="h-4 w-4 text-gray-400 flex-shrink-0" />
							<div className="flex-1">
								<p className="text-sm text-gray-600">
									<span className="font-medium">Requested by:</span> {requestedBy.name} ({requestedBy.email})
								</p>
							</div>
						</div>

						{/* Course */}
						<div className="flex items-center gap-3">
							<AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
							<div className="flex-1">
								<p className="text-sm text-gray-600">
									<span className="font-medium">Course:</span> {course.name} ({course.code})
								</p>
							</div>
						</div>

						{/* Created Date */}
						{created_at && (
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
								<div className="flex-1">
									<p className="text-sm text-gray-600">
										<span className="font-medium">Requested:</span> {formatDate(created_at)}
									</p>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
							<Button
								variant="outlined"
								color="primary"
								size="small"
								onClick={() => setEditDialogOpen(true)}
								disabled={isApproving || isRejecting || isEditing}
								startIcon={<Edit className="h-4 w-4" />}
							>
								{isEditing ? "Editing..." : "Edit"}
							</Button>
							<Button
								variant="outlined"
								color="error"
								size="small"
								onClick={() => setRejectDialogOpen(true)}
								disabled={isApproving || isRejecting || isEditing}
								startIcon={<X className="h-4 w-4" />}
							>
								{isRejecting ? "Rejecting..." : "Reject"}
							</Button>
							<Button
								variant="contained"
								color="success"
								size="small"
								onClick={handleApprove}
								disabled={isApproving || isRejecting || isEditing}
								startIcon={<Check className="h-4 w-4" />}
							>
								{isApproving ? "Approving..." : "Approve"}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Reject Dialog */}
			{rejectDialogOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Reject Request
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							Please provide a reason for rejecting this request:
						</p>
						<textarea
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder="Enter rejection reason..."
							className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
							rows={4}
						/>
						<div className="flex items-center justify-end gap-3 mt-6">
							<Button
								variant="outlined"
								onClick={() => {
									setRejectDialogOpen(false);
									setRejectReason("");
								}}
								disabled={isRejecting}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								color="error"
								onClick={handleReject}
								disabled={isRejecting || !rejectReason.trim()}
							>
								{isRejecting ? "Rejecting..." : "Reject Request"}
							</Button>
						</div>
					</div>
				</div>
			)}

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

			{/* Snackbar */}
			{snackbar.open && (
				<div className="fixed bottom-4 right-4 z-50">
					<div className={`px-4 py-3 rounded-md shadow-lg ${
						snackbar.severity === "success" 
							? "bg-green-100 text-green-800 border border-green-200" 
							: "bg-red-100 text-red-800 border border-red-200"
					}`}>
						<div className="flex items-center gap-2">
							{snackbar.severity === "success" ? (
								<Check className="h-4 w-4" />
							) : (
								<X className="h-4 w-4" />
							)}
							<span className="text-sm font-medium">{snackbar.message}</span>
						</div>
					</div>
				</div>
			)}
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
