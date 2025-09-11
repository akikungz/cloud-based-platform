"use client";
import { cn } from "@midori/utils/format";
import { Button } from "@mui/material";
import { ClipboardList, SearchX } from "lucide-react";
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
}

export const PendingRequest: React.FC<PendingRequestProps> = ({
	limit = 10,
	page = 1,
	searchQuery = "",
	course = "",
	dashboard = false, // Default to false if not provided
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [requests, setRequests] = useState<PendingRequestItemProps[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Fetch real requests from API
	useEffect(() => {
		const fetchRequests = async () => {
			setIsLoading(true);
			setError(null);
			
			try {
				const response = await fetch(`${env.API_URL}/api/v1/staff/approval?skip=${page}&take=${limit}`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (response.ok) {
					const data = await response.json();
					const apiRequests = data.data?.data || [];
					
					// Transform API data to component props format
					const transformedRequests: PendingRequestItemProps[] = apiRequests.map((req: any) => ({
						id: req.id.toString(),
						title: req.title,
						description: req.description,
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
								return data.course.code.toLowerCase().includes(course.toLowerCase());
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
				setIsLoading(false);
			}
		};

		fetchRequests();
	}, [limit, page, course, searchQuery]);

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

				<Link href="/approvals" passHref>
					<Button variant="outlined" color="secondary" size="small">
						View All
					</Button>
				</Link>
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
					requests.map((request) => (
						<PendingRequestItem key={request.id} {...request} />
					))
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
