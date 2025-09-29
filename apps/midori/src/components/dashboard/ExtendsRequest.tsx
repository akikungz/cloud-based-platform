"use client";
import { cn } from "@midori/utils/format";
import { Button, Pagination, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Clock, SearchX, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	ExtensionRequestItem,
	type ExtensionRequestItemProps,
} from "./ExtensionRequestItem";
import { EmptyState, LoadingSpinner, AlertMessage } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";

interface ExtendsRequestProps {
	limit?: number;
	page?: number;
	dashboard?: boolean;
	showPagination?: boolean;
}

export const ExtendsRequest: React.FC<ExtendsRequestProps> = ({
	limit = 10,
	page = 1,
	dashboard = false,
	showPagination = true,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [requests, setRequests] = useState<ExtensionRequestItemProps[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(page);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [pageSize, setPageSize] = useState(limit);

	// Fetch extension requests from API
	const fetchRequests = async (isRefresh = false) => {
		if (isRefresh) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError(null);
		
		try {
			const result = await momoi_client.api.v1.staff.approval.extends.get({
				query: { skip: dashboard ? 1 : currentPage, take: dashboard ? 3 : pageSize }
			});

			if (!result.error) {
				const apiRequests = result.data?.data?.data || [];
				const paginationInfo = result.data?.data;
				
				// Update pagination info
				setTotalPages(paginationInfo?.totalPages || 1);
				setTotalCount(paginationInfo?.count || 0);
				
				// Transform API data to component props format
				const transformedRequests: ExtensionRequestItemProps[] = apiRequests.map((req: any) => ({
					id: req.id,
					title: req.title,
					description: req.description,
					instance_id: req.instance_id,
					instance_title: req.instance?.title || "Unknown Instance",
					instance_hostname: req.instance?.hostname || "unknown",
					requestedBy: req.user?.name || "Unknown User",
					requestedByEmail: req.user?.email || "unknown@example.com",
					course: req.course?.course_title || "Unknown Course",
					created_at: new Date(req.created_at),
				}));

				setRequests(transformedRequests);
			} else {
				setError(`Failed to fetch extension requests: ${result.error.value.message || 'Unknown error'}`);
				setRequests([]);
			}
		} catch (err) {
			console.error("Error fetching extension requests:", err);
			setError("Failed to fetch extension requests");
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
	}, dashboard ? [] : [pageSize, currentPage]);

	return (
		<div className="w-full bg-white p-6 rounded-lg shadow-md">
			{dashboard && (
				<div className="flex items-center justify-between gap-2 mb-4">
					<div className="flex items-center gap-2">
						<Clock className="text-vm-blue-600 w-6 h-6" />
						<div>
							<h3 className="text-2xl font-semibold">Extension Requests</h3>
							<p className="text-vm-blue-600 text-sm">Requests to extend existing virtual machine instances</p>
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
			{
				isLoading ? (
					<LoadingSpinner size="lg" centered text="Loading extension requests..." />
				) : error ? (
					<AlertMessage 
						type="error" 
						message={error}
						className="mb-4"
					/>
				) : requests.length > 0 ? (
					<>
						{requests.map((request) => (
							<ExtensionRequestItem 
								key={request.id} 
								{...request} 
								onRequestUpdate={fetchRequests}
							/>
						))}
						
						{/* Material-UI Pagination - Only show when not in dashboard mode */}
						{showPagination && !dashboard && (
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
						title="No extension requests found"
						description="There are currently no pending extension requests."
					/>
				)
			}
		</div>
	);
};

export default ExtendsRequest;
