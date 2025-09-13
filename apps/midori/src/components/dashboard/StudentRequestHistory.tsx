"use client";
import { useState, useEffect } from "react";
import { Chip, Alert, Button, Snackbar } from "@mui/material";
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, ClipboardList, Plus } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { formatRelativeDate, formatDate } from "@midori/utils/format";
import { ClientOnly, LoadingSpinner, AlertMessage, EmptyState } from "@midori/components/ui";
import Link from "next/link";

interface RequestHistoryProps {
	maxItems?: number;
	showOnlyRecent?: boolean;
}

interface InstanceRequest {
	id: number;
	title: string;
	type: string;
	state: string;
	reason: string | null;
	hostname: string;
	created_at: Date;
	updated_at: Date;
}

interface ExtensionRequest {
	id: number;
	title: string;
	state: string;
	reason: string | null;
	instance_id: number;
	created_at: Date;
	updated_at: Date;
}

export function StudentRequestHistory({ maxItems = 5, showOnlyRecent = true }: RequestHistoryProps) {
	const [requests, setRequests] = useState<InstanceRequest[]>([]);
	const [extendRequests, setExtendRequests] = useState<ExtensionRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [creatingInstance, setCreatingInstance] = useState<number | null>(null);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
		open: false,
		message: "",
		severity: "success"
	});

	useEffect(() => {
		fetchRequestHistory();
	}, [maxItems, showOnlyRecent]);

	const handleCreateInstance = async (requestId: number) => {
		setCreatingInstance(requestId);
		try {
			const result = await momoi_client.api.v1.student.requests["create-instance"].post({
				request_id: requestId
			});
			
			if (result.error) {
				setSnackbar({
					open: true,
					message: result.error.value?.message || 'Failed to create instance',
					severity: "error"
				});
			} else {
				setSnackbar({
					open: true,
					message: "Instance created successfully! It may take a few minutes to be ready.",
					severity: "success"
				});
				// Refresh the request history to update the UI
				fetchRequestHistory();
			}
		} catch (err) {
			console.error("Error creating instance:", err);
			setSnackbar({
				open: true,
				message: "Failed to create instance",
				severity: "error"
			});
		} finally {
			setCreatingInstance(null);
		}
	};

	const fetchRequestHistory = async () => {
		try {
			const result = await momoi_client.api.v1.student.requests.get();
			
			if (result.error) {
				setError(result.error.value.message || 'Failed to fetch request history');
			} else if (result.data) {
				const requestsData = result.data?.data || result.data;
				let allRequests = requestsData.requests || [];
				let allExtendRequests = requestsData.extend_requests || [];

				// Sort by creation date (newest first)
				allRequests.sort((a: InstanceRequest, b: InstanceRequest) => 
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
				allExtendRequests.sort((a: ExtensionRequest, b: ExtensionRequest) => 
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);

				// Limit items if specified
				if (maxItems > 0) {
					allRequests = allRequests.slice(0, maxItems);
					allExtendRequests = allExtendRequests.slice(0, maxItems);
				}

				// Filter to recent items if specified (last 30 days)
				if (showOnlyRecent) {
					const thirtyDaysAgo = new Date();
					thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
					
					allRequests = allRequests.filter((req: InstanceRequest) => 
						new Date(req.created_at) >= thirtyDaysAgo
					);
					allExtendRequests = allExtendRequests.filter((req: ExtensionRequest) => 
						new Date(req.created_at) >= thirtyDaysAgo
					);
				}

				setRequests(allRequests);
				setExtendRequests(allExtendRequests);
			} else {
				setError('No data received');
			}
		} catch (err) {
			console.error("Error fetching request history:", err);
			setError("Failed to fetch request history");
		} finally {
			setLoading(false);
		}
	};

	const getStateIcon = (state: string) => {
		switch (state.toLowerCase()) {
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case 'approved':
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case 'rejected':
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <AlertCircle className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStateColor = (state: string) => {
		switch (state.toLowerCase()) {
			case 'pending':
				return 'warning';
			case 'approved':
				return 'success';
			case 'rejected':
				return 'error';
			default:
				return 'default';
		}
	};


	if (loading) {
		return (
			<div className="w-full bg-white p-8 rounded-lg shadow-md">
				<LoadingSpinner size="lg" centered text="Loading request history..." />
			</div>
		);
	}

	const allRequests = [
		...requests.map(req => ({ ...req, type: 'instance' as const })),
		...extendRequests.map(req => ({ ...req, type: 'extension' as const }))
	].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	return (
		<div className="w-full bg-white p-8 rounded-lg shadow-md">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-vm-blue-900">
					Recent Request History
				</h3>
				<Link 
					href="/requests" 
					className="text-sm text-vm-blue-600 hover:text-vm-blue-800 flex items-center gap-1"
				>
					View All
					<ExternalLink className="w-4 h-4" />
				</Link>
			</div>

				{error && (
					<AlertMessage 
						type="error" 
						message={error} 
						className="mb-4" 
					/>
				)}

				{allRequests.length === 0 ? (
					<EmptyState
						icon={ClipboardList}
						title={showOnlyRecent ? 'No recent requests found' : 'No requests found'}
						description="Create your first request to get started."
					/>
				) : (
					<div className="space-y-3">
						{allRequests.map((request) => (
							<div key={`${request.type}-${request.id}`} className="flex items-center justify-between p-3 border border-vm-blue-200 rounded-lg hover:bg-gray-50">
								<div className="flex items-center gap-3 flex-1">
									{getStateIcon(request.state)}
									<div className="flex-1">
										<h4 className="font-semibold text-vm-blue-900">
											{request.title}
										</h4>
										<p className="text-sm text-vm-blue-600">
											{request.type === 'instance' ? 'Instance Request' : 'Extension Request'}
											{request.type === 'instance' && (request as InstanceRequest).type && 
												` • ${(request as InstanceRequest).type}`
											}
										</p>
									</div>
								</div>
								
								<div className="flex items-center gap-4">
									<Chip
										label={request.state}
										color={getStateColor(request.state) as any}
										size="small"
									/>
									<ClientOnly fallback={<p className="text-xs text-gray-500">Loading...</p>}>
										<p className="text-xs text-gray-500">
											{formatRelativeDate(request.created_at)}
										</p>
									</ClientOnly>
								</div>
							</div>
						))}
					</div>
				)}

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
		</div>
	);
}
