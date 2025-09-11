"use client";
import { cn } from "@midori/utils/format";
import { Button, Pagination, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { ClipboardList, SearchX, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	PendingRequestItem,
	type PendingRequestItemProps,
	PendingRequestItemSkeleton,
} from "./PendingRequestItem";
import { EmptyState } from "@midori/components/ui";
import { env } from "@midori/libs/env";

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

	// Fetch real requests from API
	const fetchRequests = async (isRefresh = false) => {
		if (isRefresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);
		
		try {
			const response = await fetch(`${env.API_URL}/api/v1/staff/approval?skip=${currentPage}&take=${pageSize}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data = await response.json();
				const apiRequests = data.data?.data || [];
				const paginationInfo = data.data;
				
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
				setError(`Failed to fetch requests: ${response.status}`);
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
	}, [pageSize, currentPage, course, searchQuery]);

	return (
		<div className={
			cn(
				"w-full bg-vm-orange-50 p-4 rounded-lg shadow-md",
				"flex flex-col gap-2",
				dashboard ? "h-full" : "min-h-96",
			)
		}>
			<div className={cn(dashboard ? "flex" : "hidden", "items-center justify-between gap-2 mb-2")}>
				<div className="flex items-center gap-2">
					<ClipboardList className="text-vm-orange-600 w-6 h-6" />
					<h3 className="text-2xl font-semibold">Pending Requests</h3>
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
						<Button variant="outlined" color="secondary" size="small">
							View All
						</Button>
					</Link>
				</div>
			</div>
			{
				isLoading ? (
					Array.from({ length: limit }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <Skeletons should not have keys></Skeletons>
						<PendingRequestItemSkeleton key={index} />
					))
				) : error ? (
					<EmptyState
						icon={SearchX}
						title="Error loading requests"
						description={error}
					/>
				) : requests.length > 0 ? (
					<>
						{requests.map((request) => (
							<PendingRequestItem 
								key={request.id} 
								{...request} 
								onRequestUpdate={fetchRequests}
							/>
						))}
						
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
