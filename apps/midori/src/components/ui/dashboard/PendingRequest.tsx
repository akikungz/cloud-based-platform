"use client";
import { useLoading } from "@midori/contexts/loading";
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
	const { isLoading, setIsLoading } = useLoading();
	const [requests, setRequests] = useState<PendingRequestItemProps[]>([]);

	// Simulate fetching requests
	useEffect(() => {
		const fetchRequests = async () => {
			setIsLoading(true);
			// Simulate an API call
			const simulatedRequests: PendingRequestItemProps[] = Array.from(
				{ length: limit },
				(_, i) => {
					const index = (page - 1) * limit + i;

					return {
						id: `request-${index + 1}`,
						title: `Request ${index + 1}`,
						description: `Description for request ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
						requestedBy: {
							id: `user-${index + 1}`,
							name: `User ${index + 1}`,
							email: `user${index + 1}@example.com`,
						},
						course: {
							id: `course-${index + 1}`,
							name: `Course ${index + 1}`,
							code: `06023310${index + 1}`,
						},
						spec: {
							os: "Ubuntu 20.04 (LXC)",
							cpu: 2, // Increment CPU for each request
							memory: 1024 * 2, // Increment memory for each request
							storage: 20,
						},
					}
				},
			)
				.filter((data) => {
					if (course.length > 0 && course !== "All") {
						return data.course.code.toLowerCase().includes(course.toLowerCase());
					}
					return true; // Include all if no course filter is applied
				})
				.filter((data) => {
					return data.title.toLowerCase().includes(searchQuery.toLowerCase())
						|| data.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
				});

			// Update the requests state
			setRequests(simulatedRequests);
			console.log("Fetched requests:", simulatedRequests);
			setTimeout(() => {
				setIsLoading(false);
			}, 3000); // Simulate a delay for loading
		};
		// Call the simulated fetch function
		fetchRequests();
		return () => {
			// Cleanup if necessary
			setRequests([]);
			setIsLoading(false);
		}
	}, [limit, page, course, searchQuery, setIsLoading]);

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

				<Link href="/approval" passHref>
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
				) :
					requests.length > 0 ? (
						requests.map((request) => (
							<PendingRequestItem key={request.id} {...request} />
						))
					) : (
						<div className="flex flex-col items-center justify-center text-gray-500 flex-1">
							<SearchX className="w-12 h-12 mb-2" />
							<p className="text-sm">No pending requests found.</p>
							<p className="text-xs">Try adjusting your search or filters.</p>
						</div>
					)
			}
		</div>
	);
};

export default PendingRequest;
