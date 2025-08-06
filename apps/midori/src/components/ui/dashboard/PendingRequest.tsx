"use client";
import { Button } from "@mui/material";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import PendingRequestItem, {
	type PendingRequestItemProps,
} from "./PendingRequestItem";

interface PendingRequestProps {
	limit?: number;
	searchQuery?: string;
}

export const PendingRequest: React.FC<PendingRequestProps> = ({
	limit = 10,
	searchQuery = "",
}) => {
	const [requests, setRequests] = useState<PendingRequestItemProps[]>([]);

	// Simulate fetching requests
	useEffect(() => {
		const fetchRequests = async () => {
			// Simulate an API call
			const simulatedRequests: PendingRequestItemProps[] = Array.from(
				{ length: limit },
				(_, index) => ({
					id: `request-${index + 1}`,
					title: `Request ${index + 1}`,
					description: `Description for request ${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
					requestedBy: {
						name: `User ${index + 1}`,
						email: `user${index + 1}@example.com`,
					},
					course: {
						name: `Course ${index + 1}`,
						code: `06023310${index + 1}`,
					},
					spec: {
						os: "Ubuntu 20.04 (LXC)",
						cpu: 2 ** index, // Increment CPU for each request
						memory: 1024 * 2 ** index, // Increment memory for each request
						storage: 20,
					},
				}),
			);
			setRequests(simulatedRequests);
		};
		// Call the simulated fetch function
		fetchRequests();
	}, [limit]);

	return (
		<div className="mt-6 w-full bg-vm-orange-50 p-4 rounded-lg shadow-md flex flex-col space-y-4">
			<div className="flex items-center justify-between space-x-2">
				<div className="flex items-center space-x-2">
					<ClipboardList className="text-vm-orange-600 w-6 h-6" />
					<h3 className="text-2xl font-semibold">Pending Requests</h3>
				</div>

				<Link href="/requests" passHref>
					<Button variant="outlined" color="secondary" size="small">
						View All
					</Button>
				</Link>
			</div>

			<div className="flex flex-col space-y-2">
				{requests
					.filter((request) => {
						const query = searchQuery.toLowerCase();
						return (
							request.title.toLowerCase().includes(query) ||
							request.description.toLowerCase().includes(query) ||
							request.requestedBy.name.toLowerCase().includes(query) ||
							request.course.name.toLowerCase().includes(query) ||
							request.course.code.toLowerCase().includes(query)
						);
					})
					.map((request) => (
						<PendingRequestItem key={request.id} {...request} />
					))}
			</div>
		</div>
	);
};

export default PendingRequest;
