"use client";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { useEffect, useState } from "react";
import { Button, Chip, Card, CardContent, Typography, Box, Alert } from "@mui/material";
import { momoi_client } from "@midori/libs/momoi";
import { Play, Square, Trash2, ExternalLink, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDateTime } from "@midori/utils/format";

interface Instance {
	id: number;
	title: string;
	description: string;
	status: string;
	cpus: number;
	memory: number;
	disk: number;
	ip_address?: string;
	semester?: string;
	created_at: string;
	updated_at: string;
}

export default function InstanceDetailsPage() {
	const params = useParams();
	const instanceId = parseInt(params.id as string);
	
	const [instance, setInstance] = useState<Instance | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!instanceId || isNaN(instanceId)) {
			setError('Invalid instance ID');
			setLoading(false);
			return;
		}

		const fetchInstance = async () => {
			try {
				const result = await momoi_client.api.v1.student.instances({ id: instanceId }).get();
				
				if (result.error) {
					setError(result.error.message || 'Failed to fetch instance');
				} else if (result.data) {
					const instanceData = result.data?.data || result.data;
					setInstance(instanceData);
				} else {
					setError('No data received');
				}
			} catch (err) {
				console.error("Error fetching instance:", err);
				setError("Failed to fetch instance");
			} finally {
				setLoading(false);
			}
		};

		fetchInstance();
	}, [instanceId]);

	const handleDeleteInstance = async () => {
		if (!confirm("Are you sure you want to delete this instance? This action cannot be undone.")) {
			return;
		}

		try {
			const result = await momoi_client.api.v1.student.instances({ id: instanceId }).delete();
			
			if (result.error) {
				alert(`Failed to delete instance: ${result.error.message}`);
			} else {
				alert('Instance deleted successfully');
				// Redirect to instances list
				window.location.href = '/instances/student';
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
			case 'error':
				return 'error';
			default:
				return 'default';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case 'running':
				return <Play className="h-4 w-4" />;
			case 'stopped':
				return <Square className="h-4 w-4" />;
			case 'pending':
				return <RefreshCw className="h-4 w-4 animate-spin" />;
			default:
				return <RefreshCw className="h-4 w-4" />;
		}
	};


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error || !instance) {
		return (
			<RoleGuard allowedRoles={[Role.Student]}>
				<div className="container mx-auto px-4 py-6">
					<Alert severity="error" className="mb-6">
						{error || 'Instance not found'}
					</Alert>
					<Link href="/instances/student">
						<Button variant="outlined" startIcon={<ArrowLeft />}>
							Back to Instances
						</Button>
					</Link>
				</div>
			</RoleGuard>
		);
	}

	return (
		<RoleGuard allowedRoles={[Role.Student]}>
			<div className="flex flex-col items-center justify-center gap-4">
				<div className="flex flex-col w-full px-2 pt-2">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<h2 className="text-3xl font-semibold">{instance.title}</h2>
							<p className="text-vm-blue-600">{instance.description}</p>
						</div>
						<div className="flex items-center gap-2">
							<Link href="/instances/student">
								<Button variant="outlined" startIcon={<ArrowLeft />}>
									Back to Instances
								</Button>
							</Link>
							{instance.ip_address && (
								<Button
									variant="contained"
									startIcon={<ExternalLink />}
									className="bg-green-600 hover:bg-green-700"
									onClick={() => window.open(`http://${instance.ip_address}`, '_blank')}
								>
									Connect
								</Button>
							)}
							<Button
								variant="outlined"
								color="error"
								startIcon={<Trash2 />}
								onClick={handleDeleteInstance}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>

				<div className="w-full bg-white p-8 rounded-lg shadow-md">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Instance Overview */}
						<div className="lg:col-span-2">
						<Card>
							<CardContent>
								<Typography variant="h6" className="mb-4 flex items-center gap-2">
									Instance Overview
									<Chip
										icon={getStatusIcon(instance.status)}
										label={instance.status}
										color={getStatusColor(instance.status) as any}
										size="small"
									/>
								</Typography>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Box className="p-4 bg-gray-50 rounded">
										<Typography variant="caption" color="text.secondary">
											CPU Cores
										</Typography>
										<Typography variant="h6">
											{instance.cpus}
										</Typography>
									</Box>
									<Box className="p-4 bg-gray-50 rounded">
										<Typography variant="caption" color="text.secondary">
											Memory
										</Typography>
										<Typography variant="h6">
											{instance.memory} MB
										</Typography>
									</Box>
									<Box className="p-4 bg-gray-50 rounded">
										<Typography variant="caption" color="text.secondary">
											Storage
										</Typography>
										<Typography variant="h6">
											{instance.disk} GB
										</Typography>
									</Box>
									<Box className="p-4 bg-gray-50 rounded">
										<Typography variant="caption" color="text.secondary">
											IP Address
										</Typography>
										<Typography variant="h6">
											{instance.ip_address || 'Not assigned'}
										</Typography>
									</Box>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Instance Details */}
					<div className="lg:col-span-1">
						<Card>
							<CardContent>
								<Typography variant="h6" className="mb-4">
									Instance Details
								</Typography>

								<div className="space-y-3">
									<div>
										<Typography variant="caption" color="text.secondary">
											Instance ID
										</Typography>
										<Typography variant="body2">
											{instance.id}
										</Typography>
									</div>
									
									<div>
										<Typography variant="caption" color="text.secondary">
											Semester
										</Typography>
										<Typography variant="body2">
											{instance.semester || 'Not assigned'}
										</Typography>
									</div>
									
									<div>
										<Typography variant="caption" color="text.secondary">
											Created
										</Typography>
										<Typography variant="body2">
											{formatDateTime(instance.created_at)}
										</Typography>
									</div>
									
									<div>
										<Typography variant="caption" color="text.secondary">
											Last Updated
										</Typography>
										<Typography variant="body2">
											{formatDateTime(instance.updated_at)}
										</Typography>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card className="mt-4">
							<CardContent>
								<Typography variant="h6" className="mb-4">
									Quick Actions
								</Typography>

								<div className="space-y-2">
									<Link href="/dashboard">
										<Button
											variant="outlined"
											fullWidth
											startIcon={<RefreshCw />}
										>
											Create Extension Request
										</Button>
									</Link>
									
									{instance.status === 'running' && (
										<Button
											variant="outlined"
											fullWidth
											startIcon={<Square />}
											color="warning"
										>
											Stop Instance
										</Button>
									)}
									
									{instance.status === 'stopped' && (
										<Button
											variant="outlined"
											fullWidth
											startIcon={<Play />}
											color="success"
										>
											Start Instance
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
					</div>
				</div>
			</div>
		</RoleGuard>
	);
}
