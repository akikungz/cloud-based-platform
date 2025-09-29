"use client";
import { cn } from "@midori/utils/format";
import { Button, Pagination, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { ClipboardList, SearchX, RefreshCw, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	PendingRequestItem,
	type PendingRequestItemProps,
	PendingRequestItemSkeleton,
} from "./PendingRequestItem";
import { EmptyState, LoadingSpinner, AlertMessage } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";

interface PendingRequestProps {
	limit?: number;
	page?: number;
	course?: string; // Optional course filter
	searchQuery?: string;
	dashboard?: boolean; // Optional prop to indicate if this is used in the dashboard
	showPagination?: boolean; // Optional prop to show/hide pagination
}

export const PendingRequest: React.FC<PendingRequestProps> = ({
	limit = 10,
	page = 1,
	searchQuery = "",
	course = "",
	dashboard = false, // Default to false if not provided
	showPagination = true, // Default to true for pagination
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [requests, setRequests] = useState<PendingRequestItemProps[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(page);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize, setPageSize] = useState(limit);
	const [stats, setStats] = useState({
		totalRequests: 0,
		pendingRequests: 0,
		processedRequests: 0,
	});

	// Fetch statistics
	const fetchStats = async () => {
		try {
			const result = await momoi_client.api.v1.staff.approval.stats.get();

			if (!result.error) {
				const statsData = result.data?.data;
				if (statsData) {
					setStats({
						totalRequests: statsData.instanceRequests.total,
						pendingRequests: statsData.instanceRequests.pending,
						processedRequests: statsData.instanceRequests.processed,
					});
				}
			}
		} catch (err) {
			console.error("Error fetching stats:", err);
		}
	};

	// Fetch real requests from API
	const fetchRequests = async (isRefresh = false) => {
		if (isRefresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);
		
		try {
			const result = await momoi_client.api.v1.staff.approval.get({
				query: { skip: currentPage, take: pageSize }
			});

			if (!result.error) {
				const apiRequests = result.data?.data?.data || [];
				const paginationInfo = result.data?.data;
				
				// Update pagination info
				setTotalPages(paginationInfo?.totalPages || 1);
				setTotalCount(paginationInfo?.count || 0);
				
				// Transform API data to component props format
				const transformedRequests: PendingRequestItemProps[] = apiRequests.map((req: any) => ({
					id: req.id.toString(),
					title: req.title,
					description: req.description,
					hostname: req.hostname, // Add hostname from API
					requestedBy: {
						id: req.user_id,
						name: req.user?.name || "Unknown User",
						email: req.user?.email || "unknown@example.com",
					},
					course: {
						id: req.course_id.toString(),
						name: req.course?.course_title || "Unknown Course",
						code: req.course?.course_id || "N/A",
					},
					spec: {
						os: "Ubuntu 20.04 (LXC)", // This would come from template data
						cpu: req.cpus,
						memory: req.memory,
						storage: req.disk,
					},
					created_at: new Date(req.created_at),
				}));

					// Apply filters
					const filteredRequests = transformedRequests
						.filter((data) => {
							if (course.length > 0 && course !== "All") {
								return data.course.code === course;
							}
							return true;
						})
						.filter((data) => {
							return data.title.toLowerCase().includes(searchQuery.toLowerCase())
								|| data.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
						});

				setRequests(filteredRequests);
			} else {
				setError(`Failed to fetch requests: ${result.error.value.message || 'Unknown error'}`);
				setRequests([]);
			}
		} catch (err) {
			console.error("Error fetching requests:", err);
			setError("Failed to fetch requests");
			setRequests([]);
		} finally {
			if (isRefresh) {
				setIsRefreshing(false);
			} else {
				setIsLoading(false);
			}
		}
	};

	// Handle refresh
	const handleRefresh = () => {
		fetchRequests(true);
		fetchStats();
	};

	// Handle page change
	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setCurrentPage(value);
	};

	// Handle page size change
	const handlePageSizeChange = (event: any) => {
		const newPageSize = event.target.value;
		setPageSize(newPageSize);
		setCurrentPage(1); // Reset to first page when changing page size
	};


	useEffect(() => {
		fetchRequests();
		fetchStats();
	}, [pageSize, currentPage, course, searchQuery]);

	return (
		<div className="w-full bg-white p-6 rounded-lg shadow-md">
			{dashboard && (
				<div className="flex items-center justify-between gap-2 mb-4">
					<div className="flex items-center gap-2">
						<ClipboardList className="text-vm-orange-600 w-6 h-6" />
						<div>
							<h3 className="text-2xl font-semibold">Pending Requests</h3>
							<p className="text-vm-orange-600 text-sm">New virtual machine requests awaiting approval</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outlined"
							color="secondary"
							size="small"
							onClick={handleRefresh}
							disabled={isRefreshing}
							startIcon={<RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />}
						>
							{isRefreshing ? "Refreshing..." : "Refresh"}
						</Button>
						<Link href="/approvals" passHref>
							<Button variant="outlined" color="primary" size="small">
								View All
							</Button>
						</Link>
					</div>
				</div>
			)}

			{/* Statistics Cards */}
			{!dashboard && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					{/* Total Requests Card */}
					<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-orange-100 rounded-lg">
								<Clock className="h-6 w-6 text-orange-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-orange-600">Total Requests</p>
								<p className="text-2xl font-bold text-orange-900">{stats.totalRequests}</p>
							</div>
						</div>
					</div>

					{/* Pending Requests Card */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<AlertCircle className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-blue-600">Pending</p>
								<p className="text-2xl font-bold text-blue-900">{stats.pendingRequests}</p>
							</div>
						</div>
					</div>

					{/* Processed Requests Card */}
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-green-600">Processed</p>
								<p className="text-2xl font-bold text-green-900">{stats.processedRequests}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{
				isLoading ? (
					<LoadingSpinner size="lg" centered text="Loading requests..." />
				) : error ? (
					<AlertMessage 
						type="error" 
						message={error}
						className="mb-4"
					/>
				) : requests.length > 0 ? (
					<>
						<div className="space-y-4">
							{requests.map((request) => (
								<PendingRequestItem 
									key={request.id} 
									{...request} 
									onRequestUpdate={fetchRequests}
								/>
							))}
						</div>
							
						{/* Material-UI Pagination */}
						{showPagination && (
							<Box className="mt-6 space-y-4">
								{/* Pagination Controls */}
								<Box className="flex items-center justify-between w-full">
									{/* Page Size Selector */}
									<FormControl size="small" className="max-w-[120px]" fullWidth>
										<InputLabel>Per page</InputLabel>
										<Select
											value={pageSize}
											label="Per page"
											onChange={handlePageSizeChange}
										>
											<MenuItem value={5}>5</MenuItem>
											<MenuItem value={10}>10</MenuItem>
											<MenuItem value={20}>20</MenuItem>
											<MenuItem value={50}>50</MenuItem>
										</Select>
									</FormControl>

									{/* Results info */}
									<Box className="text-center text-sm text-gray-600">
										Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} requests
									</Box>

									{/* Material-UI Pagination Component */}
									<Pagination
										count={totalPages}
										page={currentPage}
										onChange={handlePageChange}
										color="primary"
										size="small"
										showFirstButton
										showLastButton
										siblingCount={1}
										boundaryCount={1}
									/>
								</Box>
							</Box>
						)}
					</>
				) : (
					<EmptyState
						icon={SearchX}
						title="No pending requests found"
						description="Try adjusting your search or filters."
					/>
				)
			}
		</div>
	);
};

export default PendingRequest;
