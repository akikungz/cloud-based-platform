"use client";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import { Button, Chip, Stack } from "@mui/material";
import { ClipboardList } from "lucide-react";

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
		<div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 gap-2">
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
			<Stack direction={{ xs: "row", sm: "column" }} spacing={1} className="flex-shrink-0">
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

export default PendingRequestItem;
