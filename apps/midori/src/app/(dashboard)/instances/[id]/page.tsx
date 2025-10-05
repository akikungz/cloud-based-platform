"use client";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { useEffect, useState, useContext } from "react";
import { Button, Chip, Card, CardContent, Typography, Box, Alert, Menu, MenuItem, Divider } from "@mui/material";
import { momoi_client } from "@midori/libs/momoi";
import { 
	Play, Square, Trash2, ExternalLink, ArrowLeft, RefreshCw, 
	Pause, RotateCw, Monitor, Globe, Cpu, MemoryStick, HardDrive,
	Calendar, User, Database, MoreVertical, Archive, Clock
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDateTime } from "@midori/utils/format";
import { UserContext } from "@midori/contexts/user";

interface Instance {
	id: number;
	title: string;
	hostname?: string;
	description: string;
	status: string;
	type?: string;
	cpus: number;
	memory: number;
	disk: number;
	vmid?: number;
	node?: string;
	ip_address?: string | {
		ip: string;
		network: {
			name: string;
			network: string;
			gateway: string;
		};
	};
	course?: {
		course_id: string;
		course_title: string;
	};
	semester?: {
		active: boolean;
		name: string;
		id: number;
		created_at: Date;
		updated_at: Date;
		deleted_at: Date | null;
		start_at: Date;
		end_at: Date;
	} | null;
	user?: {
		id: string;
		name: string;
		email: string;
	};
	archived?: boolean;
	created_at: Date;
	updated_at: Date;
}

export default function InstanceDetailsPage() {
	const params = useParams();
	const instanceId = parseInt(params.id as string);
	const { user } = useContext(UserContext);

	const [instance, setInstance] = useState<Instance | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const isStaff = user?.role === Role.Staff;

	useEffect(() => {
		if (!instanceId || isNaN(instanceId)) {
			setError('Invalid instance ID');
			setLoading(false);
			return;
		}

		const fetchInstance = async () => {
			try {
				// Try staff endpoint first if user is staff, otherwise use student endpoint
				const result = isStaff 
					? await momoi_client.api.v1.staff.instances({ id: instanceId }).get()
					: await momoi_client.api.v1.student.instances({ id: instanceId }).get();

				if (result.error) {
					setError(result.error.value.message || 'Failed to fetch instance');
				} else if (result.data) {
					const instanceData = (result.data! as unknown as any).data || result.data;
					setInstance(instanceData as Instance);
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
	}, [instanceId, isStaff]);

	const handleVMAction = async (action: 'start' | 'stop' | 'reboot' | 'suspend' | 'resume') => {
		setActionLoading(true);
		setAnchorEl(null);
		try {
			const result = isStaff
				? await momoi_client.api.v1.staff.instances({ id: instanceId }).status.post({ action })
				: await momoi_client.api.v1.student.instances({ id: instanceId }).status.post({ action });

			if (result.error) {
				alert(`Failed to ${action} instance: ${result.error.value.message}`);
			} else {
				alert(`VM ${action} request sent successfully`);
				// Refresh instance data
				window.location.reload();
			}
		} catch (error) {
			console.error(`Error ${action} instance:`, error);
			alert(`Failed to ${action} instance`);
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteInstance = async () => {
		if (!confirm("Are you sure you want to delete this instance? This action cannot be undone.")) {
			return;
		}

		setActionLoading(true);
		try {
			const result = isStaff
				? await momoi_client.api.v1.staff.instances({ id: instanceId }).delete()
				: await momoi_client.api.v1.student.instances({ id: instanceId }).delete();

			if (result.error) {
				alert(`Failed to delete instance: ${result.error.value.message}`);
			} else {
				alert('Instance deleted successfully');
				// Redirect to instances list
				window.location.href = isStaff ? '/instances' : '/instances/student';
			}
		} catch (error) {
			console.error("Error deleting instance:", error);
			alert("Failed to delete instance");
		} finally {
			setActionLoading(false);
		}
	};

	const handleArchiveInstance = async () => {
		if (!isStaff) return;
		setActionLoading(true);
		setAnchorEl(null);
		try {
			const result = await momoi_client.api.v1.staff.instances({ id: instanceId }).archive.post();
			if (result.error) {
				alert(`Failed to archive instance: ${result.error.value.message}`);
			} else {
				alert('Instance archived successfully (marked as permanent storage)');
				window.location.reload();
			}
		} catch (error) {
			console.error("Error archiving instance:", error);
			alert("Failed to archive instance");
		} finally {
			setActionLoading(false);
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

	const getIPAddress = () => {
		if (!instance?.ip_address) return 'Not assigned';
		if (typeof instance.ip_address === 'string') return instance.ip_address;
		return instance.ip_address.ip;
	};

	if (error || !instance) {
		return (
			<RoleGuard allowedRoles={[Role.Student, Role.Staff]}>
				<div className="container mx-auto px-4 py-6">
					<Alert severity="error" className="mb-6">
						{error || 'Instance not found'}
					</Alert>
					<Link href={isStaff ? "/instances" : "/instances/student"}>
						<Button variant="outlined" startIcon={<ArrowLeft />}>
							Back to Instances
						</Button>
					</Link>
				</div>
			</RoleGuard>
		);
	}

	return (
		<RoleGuard allowedRoles={[Role.Student, Role.Staff]}>
			<div className="flex flex-col items-center justify-center gap-4">
				{/* Header */}
				<div className="flex flex-col w-full px-2 pt-2">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-2">
								<h2 className="text-3xl font-semibold truncate">{instance.title}</h2>
								<Chip
									icon={getStatusIcon(instance.status)}
									label={instance.status}
									color={getStatusColor(instance.status) as any}
									size="medium"
								/>
								{instance.archived && (
									<Chip
										icon={<Archive className="h-4 w-4" />}
										label="Archived"
										color="default"
										size="small"
									/>
								)}
							</div>
							<p className="text-vm-blue-600">{instance.description}</p>
							{instance.hostname && (
								<div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
									<Monitor className="h-4 w-4" />
									<span className="font-mono">{instance.hostname}</span>
								</div>
							)}
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							<Link href={isStaff ? "/instances" : "/instances/student"}>
								<Button variant="outlined" startIcon={<ArrowLeft />}>
									Back
								</Button>
							</Link>
							
							{/* VM Control Buttons */}
							{instance.status === 'stopped' && (
								<Button
									variant="contained"
									color="success"
									startIcon={<Play className="h-4 w-4" />}
									onClick={() => handleVMAction('start')}
									disabled={actionLoading}
								>
									Start
								</Button>
							)}
							{instance.status === 'running' && (
								<Button
									variant="contained"
									color="warning"
									startIcon={<Square className="h-4 w-4" />}
									onClick={() => handleVMAction('stop')}
									disabled={actionLoading}
								>
									Stop
								</Button>
							)}
							
							{/* More Actions Menu */}
							<Button
								variant="outlined"
								startIcon={<MoreVertical className="h-4 w-4" />}
								onClick={(e) => setAnchorEl(e.currentTarget)}
								disabled={actionLoading}
							>
								Actions
							</Button>
							<Menu
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={() => setAnchorEl(null)}
							>
								<MenuItem onClick={() => handleVMAction('reboot')} disabled={instance.status !== 'running'}>
									<RotateCw className="h-4 w-4 mr-2" />
									Reboot
								</MenuItem>
								<MenuItem onClick={() => handleVMAction('suspend')} disabled={instance.status !== 'running'}>
									<Pause className="h-4 w-4 mr-2" />
									Suspend
								</MenuItem>
								<MenuItem onClick={() => handleVMAction('resume')} disabled={instance.status !== 'stopped'}>
									<Play className="h-4 w-4 mr-2" />
									Resume
								</MenuItem>
								<Divider />
								{isStaff && !instance.archived && (
									<MenuItem onClick={handleArchiveInstance}>
										<Archive className="h-4 w-4 mr-2" />
										Archive (Permanent Storage)
									</MenuItem>
								)}
								<MenuItem onClick={handleDeleteInstance} style={{ color: 'red' }}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Instance
								</MenuItem>
							</Menu>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="w-full bg-white p-6 rounded-lg shadow-md">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Column - Specifications & Network */}
						<div className="lg:col-span-2 space-y-6">
							{/* Resource Specifications */}
							<Card>
								<CardContent>
									<Typography variant="h6" className="mb-4 flex items-center gap-2">
										<Cpu className="h-5 w-5" />
										Resource Specifications
									</Typography>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
										<Box className="p-4 bg-blue-50 rounded-lg border border-blue-200">
											<div className="flex items-center gap-2 mb-1">
												<Cpu className="h-4 w-4 text-blue-600" />
												<Typography variant="caption" color="text.secondary">
													CPU Cores
												</Typography>
											</div>
											<Typography variant="h5" className="font-bold text-blue-600">
												{instance.cpus}
											</Typography>
										</Box>
										<Box className="p-4 bg-green-50 rounded-lg border border-green-200">
											<div className="flex items-center gap-2 mb-1">
												<MemoryStick className="h-4 w-4 text-green-600" />
												<Typography variant="caption" color="text.secondary">
													Memory
												</Typography>
											</div>
											<Typography variant="h5" className="font-bold text-green-600">
												{instance.memory} MB
											</Typography>
										</Box>
										<Box className="p-4 bg-purple-50 rounded-lg border border-purple-200">
											<div className="flex items-center gap-2 mb-1">
												<HardDrive className="h-4 w-4 text-purple-600" />
												<Typography variant="caption" color="text.secondary">
													Storage
												</Typography>
											</div>
											<Typography variant="h5" className="font-bold text-purple-600">
												{instance.disk} GB
											</Typography>
										</Box>
										<Box className="p-4 bg-orange-50 rounded-lg border border-orange-200">
											<div className="flex items-center gap-2 mb-1">
												<Database className="h-4 w-4 text-orange-600" />
												<Typography variant="caption" color="text.secondary">
													Status
												</Typography>
											</div>
											<Typography variant="body1" className="font-bold text-orange-600 capitalize">
												{instance.status}
											</Typography>
										</Box>
									</div>
								</CardContent>
							</Card>

							{/* Network Information */}
							<Card>
								<CardContent>
									<Typography variant="h6" className="mb-4 flex items-center gap-2">
										<Globe className="h-5 w-5" />
										Network Information
									</Typography>
									<div className="space-y-3">
										<Box className="p-4 bg-gray-50 rounded-lg">
											<Typography variant="caption" color="text.secondary" className="block mb-1">
												IP Address
											</Typography>
											<Typography variant="h6" className="font-mono">
												{getIPAddress()}
											</Typography>
										</Box>
										{typeof instance.ip_address === 'object' && instance.ip_address?.network && (
											<>
												<Box className="p-4 bg-gray-50 rounded-lg">
													<Typography variant="caption" color="text.secondary" className="block mb-1">
														Network
													</Typography>
													<Typography variant="body1" className="font-mono">
														{instance.ip_address.network.network}
													</Typography>
												</Box>
												<Box className="p-4 bg-gray-50 rounded-lg">
													<Typography variant="caption" color="text.secondary" className="block mb-1">
														Gateway
													</Typography>
													<Typography variant="body1" className="font-mono">
														{instance.ip_address.network.gateway}
													</Typography>
												</Box>
											</>
										)}
										{instance.vmid && (
											<Box className="p-4 bg-gray-50 rounded-lg">
												<Typography variant="caption" color="text.secondary" className="block mb-1">
													Proxmox VM ID
												</Typography>
												<Typography variant="body1" className="font-mono">
													{instance.vmid} {instance.node && `(${instance.node})`}
												</Typography>
											</Box>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Course & User Information (if available) */}
							{(instance.course || instance.user) && (
								<Card>
									<CardContent>
										<Typography variant="h6" className="mb-4 flex items-center gap-2">
											<User className="h-5 w-5" />
											Additional Information
										</Typography>
										<div className="space-y-3">
											{instance.course && (
												<Box className="p-4 bg-gray-50 rounded-lg">
													<Typography variant="caption" color="text.secondary" className="block mb-1">
														Course
													</Typography>
													<Typography variant="body1">
														{instance.course.course_id} - {instance.course.course_title}
													</Typography>
												</Box>
											)}
											{instance.user && (
												<Box className="p-4 bg-gray-50 rounded-lg">
													<Typography variant="caption" color="text.secondary" className="block mb-1">
														Owner
													</Typography>
													<Typography variant="body1">
														{instance.user.name}
													</Typography>
													<Typography variant="caption" color="text.secondary" className="font-mono">
														{instance.user.email}
													</Typography>
												</Box>
											)}
											{instance.type && (
												<Box className="p-4 bg-gray-50 rounded-lg">
													<Typography variant="caption" color="text.secondary" className="block mb-1">
														Instance Type
													</Typography>
													<Typography variant="body1" className="capitalize">
														{instance.type}
													</Typography>
												</Box>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Right Column - Details & Actions */}
						<div className="lg:col-span-1 space-y-6">
							{/* Instance Metadata */}
							<Card>
								<CardContent>
									<Typography variant="h6" className="mb-4 flex items-center gap-2">
										<Clock className="h-5 w-5" />
										Instance Details
									</Typography>
									<div className="space-y-4">
										<div>
											<Typography variant="caption" color="text.secondary" className="block mb-1">
												Instance ID
											</Typography>
											<Typography variant="body1" className="font-mono">
												#{instance.id}
											</Typography>
										</div>
										{instance.semester && (
											<div>
												<Typography variant="caption" color="text.secondary" className="block mb-1">
													Semester
												</Typography>
												<div className="flex items-center gap-2">
													<Calendar className="h-4 w-4" />
													<Typography variant="body1">
														{instance.semester.name}
													</Typography>
												</div>
												<Typography variant="caption" color="text.secondary">
													{instance.semester.active ? '(Active)' : '(Inactive)'}
												</Typography>
											</div>
										)}
										<Divider />
										<div>
											<Typography variant="caption" color="text.secondary" className="block mb-1">
												Created
											</Typography>
											<Typography variant="body2">
												{formatDateTime(instance.created_at)}
											</Typography>
										</div>
										<div>
											<Typography variant="caption" color="text.secondary" className="block mb-1">
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
							{!isStaff && (
								<Card>
									<CardContent>
										<Typography variant="h6" className="mb-4">
											Quick Actions
										</Typography>
										<div className="space-y-2">
											<Link href="/requests">
												<Button
													variant="outlined"
													fullWidth
													startIcon={<RefreshCw />}
												>
													Request Extension
												</Button>
											</Link>
											{getIPAddress() !== 'Not assigned' && (
												<Button
													variant="contained"
													fullWidth
													startIcon={<ExternalLink />}
													onClick={() => window.open(`http://${getIPAddress()}`, '_blank')}
													disabled={instance.status !== 'running'}
												>
													Connect to VM
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</RoleGuard>
	);
}
