"use client";
import { type PendingRequestItemProps, usePendingItem } from "@midori/contexts/staff/pendingItem";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import { Button, Chip, Skeleton, Stack } from "@mui/material";
import { ClipboardList } from "lucide-react";

export type { PendingRequestItemProps } from "@midori/contexts/staff/pendingItem";

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
	id,
	title,
	description,
	requestedBy,
	course,
	spec,
}) => {
	const { setPendingItem } = usePendingItem();

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
			<Stack
				direction={{ xs: "row", sm: "column" }}
				spacing={1}
				className="flex-shrink-0"
			>
				<Button
					variant="outlined"
					color="info"
					size="small"
					style={{ justifyContent: "flex-end" }}
					endIcon={<InfoIcon />}
					onClick={() => setPendingItem({ id, title, description, requestedBy, course, spec })}
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

export const PendingRequestItemSkeleton: React.FC = () => {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 gap-2">
			<div className="flex flex-col space-y-2 w-full">
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton variant="text" width={150} height={24} />
					<Stack
						direction="row"
						spacing={1}
						useFlexGap
						justifyContent="flex-start"
						className="flex-wrap"
					>
						<Skeleton variant="text" width={100} height={20} />
						<Skeleton variant="text" width={120} height={20} />
					</Stack>
				</div>

				<Skeleton variant="text" width="100%" height={60} />

				<Stack direction="row" spacing={1} useFlexGap className="flex-wrap">
					<Skeleton variant="text" width={80} height={20} />
					<Skeleton variant="text" width={80} height={20} />
					<Skeleton variant="text" width={80} height={20} />
					<Skeleton variant="text" width={80} height={20} />
				</Stack>
			</div>

			{/* Action Buttons */}
			<Stack
				direction={{ xs: "row", sm: "column" }}
				spacing={1}
				className="flex-shrink-0"
			>
				<Skeleton variant="rectangular" width={100} height={36} />
				<Skeleton variant="rectangular" width={100} height={36} />
				<Skeleton variant="rectangular" width={100} height={36} />
			</Stack>
		</div>
	);
}

export default PendingRequestItem;
