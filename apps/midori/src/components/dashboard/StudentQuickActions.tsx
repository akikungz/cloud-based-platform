"use client";
import { useState } from "react";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import { Plus, Database, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { momoi_client } from "@midori/libs/momoi";

interface QuickActionsProps {
	instanceCount?: number;
	requestCount?: number;
}

export function StudentQuickActions({ instanceCount = 0, requestCount = 0 }: QuickActionsProps) {
	const [loading, setLoading] = useState(false);

	const handleRefreshData = async () => {
		setLoading(true);
		try {
			// This could trigger a refresh of parent component data
			window.location.reload();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="mb-6">
			<CardContent>
				<Typography variant="h6" className="mb-4">
					Quick Actions
				</Typography>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Create New Request */}
					<Link href="/dashboard">
						<Button
							variant="contained"
							fullWidth
							startIcon={<Plus />}
							className="bg-blue-600 hover:bg-blue-700 h-16 flex-col gap-1"
						>
							<Typography variant="subtitle2">New Request</Typography>
							<Typography variant="caption">Create VM Instance</Typography>
						</Button>
					</Link>

					{/* View Instances */}
					<Link href="/instances/student">
						<Button
							variant="outlined"
							fullWidth
							startIcon={<Database />}
							className="h-16 flex-col gap-1"
						>
							<Typography variant="subtitle2">My Instances</Typography>
							<Typography variant="caption">
								{instanceCount} instance{instanceCount !== 1 ? 's' : ''}
							</Typography>
						</Button>
					</Link>

					{/* View Requests */}
					<Link href="/requests">
						<Button
							variant="outlined"
							fullWidth
							startIcon={<Clock />}
							className="h-16 flex-col gap-1"
						>
							<Typography variant="subtitle2">My Requests</Typography>
							<Typography variant="caption">
								{requestCount} request{requestCount !== 1 ? 's' : ''}
							</Typography>
						</Button>
					</Link>

					{/* Refresh Data */}
					<Button
						variant="outlined"
						fullWidth
						startIcon={<ExternalLink />}
						onClick={handleRefreshData}
						disabled={loading}
						className="h-16 flex-col gap-1"
					>
						<Typography variant="subtitle2">Refresh</Typography>
						<Typography variant="caption">Update Data</Typography>
					</Button>
				</div>

				{/* Help Section */}
				<Box className="mt-6 p-4 bg-blue-50 rounded-lg">
					<Typography variant="subtitle2" className="mb-2 text-blue-800">
						Need Help?
					</Typography>
					<Typography variant="body2" color="text.secondary" className="mb-3">
						Get started by creating your first VM instance request, or explore your existing instances and requests.
					</Typography>
					<div className="flex gap-2">
						<Link href="/dashboard">
							<Button size="small" variant="contained" className="bg-blue-600">
								Create Request
							</Button>
						</Link>
						<Link href="/instances/student">
							<Button size="small" variant="outlined">
								View Instances
							</Button>
						</Link>
					</div>
				</Box>
			</CardContent>
		</Card>
	);
}
