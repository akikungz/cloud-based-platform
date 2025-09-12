"use client";
import { useState, useEffect } from "react";
import { Chip, Alert } from "@mui/material";
import { Database, ExternalLink, Trash2, Cpu, MemoryStick, HardDrive, Monitor, Globe } from "lucide-react";
import { momoi_client } from "@midori/libs/momoi";
import { formatRelativeDate, formatDate, cn } from "@midori/utils/format";
import { ClientOnly, LoadingSpinner, AlertMessage, EmptyState } from "@midori/components/ui";
import Link from "next/link";

interface InstancesListProps {
	maxItems?: number;
	showOnlyRecent?: boolean;
}

interface Instance {
	id: number;
	title: string;
	hostname: string;
	description: string;
	status: string;
	cpus: number;
	memory: number;
	disk: number;
	created_at: string;
	ip_address?: {
		ip: string;
		network: {
			name: string;
			network: string;
			gateway: string;
		};
	} | null;
	course?: {
		course_title: string;
		course_id: string;
	};
	semester?: string;
}

export function StudentInstancesList({ maxItems = 3, showOnlyRecent = true }: InstancesListProps) {
	const [instances, setInstances] = useState<Instance[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInstances = async () => {
			try {
				const result = await momoi_client.api.v1.student.instances.get();
				
				if (result.error) {
					setError(result.error.message || 'Failed to fetch instances');
				} else if (result.data) {
					// Handle the API response structure: { message: string, data: T }
					const instancesData = result.data?.data || result.data;
					let allInstances = Array.isArray(instancesData) ? instancesData : [];

					// Sort by creation date (newest first)
					allInstances.sort((a: Instance, b: Instance) => 
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
					);

					// Limit items if specified
					if (maxItems > 0) {
						allInstances = allInstances.slice(0, maxItems);
					}

					// Filter to recent items if specified (last 30 days)
					if (showOnlyRecent) {
						const thirtyDaysAgo = new Date();
						thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
						
						allInstances = allInstances.filter((instance: Instance) => 
							new Date(instance.created_at) >= thirtyDaysAgo
						);
					}

					setInstances(allInstances);
				} else {
					setError('No data received');
				}
			} catch (err) {
				console.error("Error fetching instances:", err);
				setError("Failed to fetch instances");
			} finally {
				setLoading(false);
			}
		};

		fetchInstances();
	}, [maxItems, showOnlyRecent]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'running':
				return 'success';
			case 'stopped':
				return 'warning';
			case 'pending':
				return 'info';
			default:
				return 'default';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'running':
				return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
			case 'stopped':
				return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
			case 'pending':
				return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
			default:
				return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
		}
	};

	const handleDeleteInstance = async (instanceId: number) => {
		if (!confirm("Are you sure you want to delete this instance?")) {
			return;
		}

		try {
			const result = await momoi_client.api.v1.student.instances({ id: instanceId }).delete();
			
			if (result.error) {
				alert(`Failed to delete instance: ${result.error.message}`);
			} else {
				// Remove the instance from the list
				setInstances(prev => prev.filter(instance => instance.id !== instanceId));
			}
		} catch (error) {
			console.error("Error deleting instance:", error);
			alert("Failed to delete instance");
		}
	};

	if (loading) {
		return (
			<div className="w-full bg-white p-8 rounded-lg shadow-md">
				<LoadingSpinner size="lg" centered text="Loading instances..." />
			</div>
		);
	}

	return (
		<div className="w-full bg-white p-8 rounded-lg shadow-md">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold text-vm-blue-900">
					Recent Instances
				</h3>
				<Link 
					href="/instances/student" 
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

			{instances.length === 0 ? (
				<EmptyState
					icon={Database}
					title={showOnlyRecent ? 'No recent instances found' : 'No instances found'}
					description="Create a request to get your first instance."
				/>
			) : (
				<div className={cn(showOnlyRecent ? 'space-y-4' : 'space-x-4 space-y-4')}>
					{instances.map((instance) => (
						<div key={instance.id} className="p-4 border border-vm-blue-200 rounded-lg hover:bg-gray-50">
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-center gap-3 flex-1">
									{getStatusIcon(instance.status)}
									<div className="flex-1">
										<Link href={`/instances/${instance.id}`} className="hover:text-blue-600">
											<h4 className="font-semibold text-vm-blue-900">
												{instance.title}
											</h4>
										</Link>
										<div className="flex items-center gap-4 mt-1">
											<div className="flex items-center gap-1">
												<Monitor className="w-3 h-3 text-vm-blue-600" />
												<span className="text-xs text-gray-600 font-mono">{instance.hostname}</span>
											</div>
											{instance.ip_address && (
												<div className="flex items-center gap-1">
													<Globe className="w-3 h-3 text-vm-blue-600" />
													<span className="text-xs text-gray-600 font-mono">{instance.ip_address.ip}</span>
												</div>
											)}
										</div>
									</div>
								</div>
								
								<div className="flex items-center gap-2">
									<Chip
										label={instance.status}
										color={getStatusColor(instance.status) as any}
										size="small"
									/>
									<button
										onClick={() => handleDeleteInstance(instance.id)}
										className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
										title="Delete instance"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Specifications */}
							<div className="flex items-center gap-4 mb-2">
								<div className="flex items-center gap-1">
									<Cpu className="w-3 h-3 text-vm-blue-600" />
									<span className="text-xs text-gray-600">{instance.cpus} CPU</span>
								</div>
								<div className="flex items-center gap-1">
									<MemoryStick className="w-3 h-3 text-vm-blue-600" />
									<span className="text-xs text-gray-600">{instance.memory} MB</span>
								</div>
								<div className="flex items-center gap-1">
									<HardDrive className="w-3 h-3 text-vm-blue-600" />
									<span className="text-xs text-gray-600">{instance.disk} GB</span>
								</div>
							</div>

							{/* Course and Semester */}
							<div className="flex items-center justify-between">
								<div className="text-xs text-vm-blue-600">
									{instance.course && (
										<span>{instance.course.course_title} ({instance.course.course_id})</span>
									)}
									{instance.semester && (
										<span className="ml-2">• {instance.semester}</span>
									)}
								</div>
								<ClientOnly fallback={<p className="text-xs text-gray-500">Loading...</p>}>
									<p className="text-xs text-gray-500">
										{formatRelativeDate(instance.created_at)}
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
