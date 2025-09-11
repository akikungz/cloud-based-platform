"use client";
import { useState, useEffect } from "react";
import { Chip, Alert } from "@mui/material";
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, ClipboardList } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { formatRelativeDate, formatDate } from "@midori/utils/format";
import { ClientOnly } from "@midori/components/ui/ClientOnly";
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
	reason?: string;
	created_at: string;
	updated_at: string;
}

interface ExtensionRequest {
	id: number;
	title: string;
	state: string;
	reason?: string;
	instance_id: number;
	created_at: string;
	updated_at: string;
}

export function StudentRequestHistory({ maxItems = 5, showOnlyRecent = true }: RequestHistoryProps) {
	const [requests, setRequests] = useState<InstanceRequest[]>([]);
	const [extendRequests, setExtendRequests] = useState<ExtensionRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchRequestHistory = async () => {
			try {
				const result = await momoi_client.api.v1.student.requests.get();
				
				if (result.error) {
					setError(result.error.message || 'Failed to fetch request history');
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

		fetchRequestHistory();
	}, [maxItems, showOnlyRecent]);

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
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
				</div>
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
					<Alert severity="error" className="mb-4">
						{error}
					</Alert>
				)}

				{allRequests.length === 0 ? (
					<div className="text-center py-8">
						<ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<p className="text-vm-blue-600">
							{showOnlyRecent ? 'No recent requests found.' : 'No requests found.'}
						</p>
						<p className="text-vm-blue-600 mt-2">
							Create your first request to get started.
						</p>
					</div>
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
								
								<div className="flex items-center gap-2">
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
		</div>
	);
}
