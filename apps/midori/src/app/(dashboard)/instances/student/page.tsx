"use client";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { env } from "@midori/libs/env";
import { momoi_client } from "@midori/libs/momoi";
import { useEffect, useState } from "react";
import { Button, Chip } from "@mui/material";
import { Play, Square, Trash2, ExternalLink, Database, Cpu, MemoryStick, HardDrive, Monitor, Globe } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@midori/utils/format";

interface Instance {
	id: number;
	title: string;
	hostname: string;
	description: string;
	status: string;
	cpus: number;
	memory: number;
	disk: number;
	created_at: Date;
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

export default function StudentInstancesPage() {
	const [instances, setInstances] = useState<Instance[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInstances = async () => {
			try {
				const result = await momoi_client.api.v1.student.instances.get();

				if (result.error) {
					setError(result.error.value.message || 'Failed to fetch instances');
				} else if (result.data) {
					// Handle the API response structure: { message: string, data: T }
					const instancesData = result.data?.data || result.data;
					setInstances(Array.isArray(instancesData) ? instancesData : []);
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
	}, []);

	const handleDeleteInstance = async (instanceId: number) => {
		if (!confirm("Are you sure you want to delete this instance?")) {
			return;
		}

		try {
			const result = await momoi_client.api.v1.student.instances({ id: instanceId }).delete();

			if (result.error) {
				alert(`Failed to delete instance: ${result.error.value.message}`);
			} else {
				// Remove the instance from the list
				setInstances(prev => prev.filter(instance => instance.id !== instanceId));
			}
		} catch (error) {
			console.error("Error deleting instance:", error);
			alert("Failed to delete instance");
		}
	};

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

	return (
		<RoleGuard allowedRoles={[Role.Student]}>
			<div className="flex flex-col items-center justify-center gap-4">
				{/* Header */}
				<div className="flex flex-col w-full px-2 pt-2">
					<h2 className="text-3xl font-semibold">My Instances</h2>
					<p className="text-vm-blue-600">
						View and manage your virtual machine instances.
					</p>
				</div>

				{/* Student-specific content */}
				<div className="w-full bg-white p-4 rounded-lg shadow-md">
					<h3 className="text-xl font-semibold text-vm-blue-900 mb-1">
						Your Virtual Machines
					</h3>
					<p className="text-vm-blue-600 mb-6">
						Here you can view and manage your assigned virtual machines.
					</p>

					{loading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vm-blue-600 mx-auto"></div>
							<p className="mt-2 text-vm-blue-600">Loading instances...</p>
						</div>
					) : error ? (
						<div className="text-center py-8">
							<p className="text-red-600">{error}</p>
						</div>
					) : instances.length === 0 ? (
						<div className="text-center py-8 space-y-4">
							<Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-vm-blue-600">No instances found. Create a request to get started!</p>
							<Link href="/requests">
								<Button variant="contained">
									Create Request
								</Button>
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{instances.map((instance) => (
								<div key={instance.id} className="border border-vm-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-3">
										<Link href={`/instances/${instance.id}`} className="hover:text-blue-600">
											<h4 className="font-semibold text-vm-blue-900">{instance.title}</h4>
										</Link>
										<Chip
											label={instance.status}
											color={getStatusColor(instance.status) as any}
											size="small"
										/>
									</div>

									{/* Hostname */}
									<div className="flex items-center gap-2 mb-2">
										<Monitor className="w-4 h-4 text-vm-blue-600" />
										<span className="text-sm text-vm-blue-600 font-medium">Hostname:</span>
										<span className="text-sm text-gray-700 font-mono">{instance.hostname}</span>
									</div>

									{/* IP Address */}
									{instance.ip_address && (
										<div className="flex items-center gap-2 mb-2">
											<Globe className="w-4 h-4 text-vm-blue-600" />
											<span className="text-sm text-vm-blue-600 font-medium">IP:</span>
											<span className="text-sm text-gray-700 font-mono">{instance.ip_address.ip}</span>
										</div>
									)}

									{/* Specifications */}
									<div className="grid grid-cols-3 gap-2 mb-3">
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
									{instance.course && (
										<div className="mb-2">
											<p className="text-sm text-vm-blue-600">
												<span className="font-medium">Course:</span> {instance.course.course_title} ({instance.course.course_id})
											</p>
										</div>
									)}

									{instance.semester && (
										<div className="mb-2">
											<p className="text-sm text-vm-blue-600">
												<span className="font-medium">Semester:</span> {instance.semester}
											</p>
										</div>
									)}

									<p className="text-xs text-gray-500 mb-3">
										Created: {formatDate(instance.created_at)}
									</p>

									<div className="flex items-center gap-2 mb-3">
										{getStatusIcon(instance.status)}
										<span className="text-sm capitalize">{instance.status}</span>
									</div>

									<div className="flex gap-2">
										<Button
											variant="outlined"
											size="small"
											startIcon={<ExternalLink className="w-4 h-4" />}
											disabled={instance.status !== 'running'}
										>
											Connect
										</Button>
										<Button
											variant="outlined"
											color="error"
											size="small"
											startIcon={<Trash2 className="w-4 h-4" />}
											onClick={() => handleDeleteInstance(instance.id)}
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</RoleGuard>
	);
}