"use client";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import { Button, Chip, Stack } from "@mui/material";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PendingRequestProps {
	limit?: number;
	searchQuery?: string;
}

export const PendingRequest: React.FC<PendingRequestProps> = ({
	limit = 10,
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
						code: `C${index + 1}`,
					},
					spec: {
						os: "Ubuntu 20.04 (LXC)",
						cpu: 2,
						memory: 4096,
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
				<PendingRequestItem
					id="test-request"
					title="Test VM Creation"
					description="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid, molestiae doloremque qui nam eum iste accusamus delectus id soluta repellat, possimus eaque. Voluptatem quasi reprehenderit ullam iure fugiat nam asperiores."
					requestedBy={{
						name: "Thitipong Tapianthong",
						email: "s6506022620036@email.kmutnb.ac.th",
					}}
					course={{
						name: "Network Programming",
						code: "060233303",
					}}
					spec={{
						os: "Ubuntu 20.04 (QEMU)",
						cpu: 2,
						memory: 4096,
						storage: 20,
					}}
				/>

				{requests.map((request) => (
					<PendingRequestItem key={request.id} {...request} />
				))}
			</div>
		</div>
	);
};

export interface PendingRequestItemProps {
	id: string; // Optional ID for the request
	title: string;
	description: string;
	requestedBy: {
		name: string;
		email: string;
	};
	course: {
		name: string;
		code: string;
	};
	spec: {
		os: string;
		cpu: number;
		memory: number;
		storage: number;
	};
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
	title,
	description,
	requestedBy,
	course,
	spec,
}) => {
	return (
		<div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
			<div className="flex flex-col space-y-2 w-full">
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center space-x-2">
						<ClipboardList className="text-vm-blue-600" />
						<span className="text-sm font-medium">{title}</span>
					</div>
					<Stack
						direction="row"
						spacing={1}
						useFlexGap
						justifyContent="flex-start"
						className="flex-wrap"
					>
						<Chip
							label={requestedBy.name}
							color="primary"
							variant="outlined"
							size="small"
						/>
						<Chip
							label={`${course.code} - ${course.name}`}
							color="secondary"
							variant="outlined"
							size="small"
						/>
					</Stack>
				</div>

				<span className="text-sm text-gray-500 text-ellipsis overflow-hidden line-clamp-3 pr-4">
					{description}
				</span>

				<Stack direction="row" spacing={1} useFlexGap className="flex-wrap">
					<Chip
						label={`OS: ${spec.os}`}
						color="info"
						variant="outlined"
						size="small"
					/>
					<Chip
						label={`CPU: ${spec.cpu} vCPUs`}
						color="info"
						variant="outlined"
						size="small"
					/>
					<Chip
						label={`Memory: ${spec.memory.toLocaleString()} MB`}
						color="info"
						variant="outlined"
						size="small"
					/>
					<Chip
						label={`Storage: ${spec.storage} GB`}
						color="info"
						variant="outlined"
						size="small"
					/>
				</Stack>
			</div>

			{/* Action Buttons */}
			<Stack direction="column" spacing={1} className="flex-shrink-0">
				<Button
					variant="outlined"
					color="info"
					size="small"
					style={{ justifyContent: "flex-end" }}
					endIcon={<InfoIcon />}
				>
					Details
				</Button>
				<Button
					variant="outlined"
					color="primary"
					size="small"
					style={{ justifyContent: "flex-end" }}
					endIcon={<CheckIcon />}
				>
					Approve
				</Button>
				<Button
					variant="outlined"
					color="error"
					size="small"
					style={{ justifyContent: "flex-end" }}
					endIcon={<CancelIcon />}
				>
					Reject
				</Button>
			</Stack>
		</div>
	);
};

export default PendingRequest;
