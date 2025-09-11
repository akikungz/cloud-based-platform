"use client";

import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	CircularProgress,
} from "@mui/material";
import { Save, X } from "lucide-react";

interface EditRequestDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: EditRequestData) => Promise<void>;
	onApprove?: () => Promise<void>;
	initialData: {
		title: string;
		description: string;
		hostname: string;
		cpus: number;
		memory: number;
		disk: number;
	};
	loading?: boolean;
	approveLoading?: boolean;
}

export interface EditRequestData {
	cpus: number;
	memory: number;
	disk: number;
}

export const EditRequestDialog: React.FC<EditRequestDialogProps> = ({
	open,
	onClose,
	onSave,
	onApprove,
	initialData,
	loading = false,
	approveLoading = false,
}) => {
	const [formData, setFormData] = useState<EditRequestData>({
		cpus: initialData.cpus,
		memory: initialData.memory,
		disk: initialData.disk,
	});
	const [errors, setErrors] = useState<Partial<Record<keyof EditRequestData, string>>>({});

	const handleInputChange = (field: keyof EditRequestData, value: string | number) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
		
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({
				...prev,
				[field]: undefined
			}));
		}
	};

	const handleStringChange = (field: keyof EditRequestData, value: string) => {
		handleInputChange(field, value);
	};

	const handleNumberChange = (field: keyof EditRequestData, value: number) => {
		handleInputChange(field, value);
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof EditRequestData, string>> = {};

		if (formData.cpus < 1) {
			newErrors.cpus = "CPU count must be at least 1";
		}
		if (formData.cpus > 8) {
			newErrors.cpus = "CPU count must not exceed 8";
		}

		if (formData.memory < 512) {
			newErrors.memory = "Memory must be at least 512 MB";
		}
		if (formData.memory > 16384) {
			newErrors.memory = "Memory must not exceed 16384 MB (16 GB)";
		}

		if (formData.disk < 8) {
			newErrors.disk = "Disk size must be at least 8 GB";
		}
		if (formData.disk > 32) {
			newErrors.disk = "Disk size must not exceed 32 GB";
		}

		setErrors(newErrors as any);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (validateForm()) {
			await onSave(formData);
		}
	};

	const handleClose = () => {
		if (!loading && !approveLoading) {
			setFormData({
				cpus: initialData.cpus,
				memory: initialData.memory,
				disk: initialData.disk,
			});
			setErrors({});
			onClose();
		}
	};

	const handleApprove = async () => {
		if (onApprove) {
			await onApprove();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			disableEscapeKeyDown={loading || approveLoading}
			sx={{ zIndex: 50 }}
		>
			<DialogTitle>
				Edit VM Specifications
			</DialogTitle>
			
			<DialogContent>
				<Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
					{/* CPU */}
					<TextField
						fullWidth
						label="CPU Cores"
						type="number"
						value={formData.cpus}
						onChange={(e) => handleNumberChange("cpus", Number(e.target.value))}
						error={!!errors.cpus}
						helperText={errors.cpus || "Minimum: 1 core, Maximum: 8 cores"}
						disabled={loading}
						inputProps={{
							min: 1,
							max: 8,
							step: 1
						}}
					/>

					{/* Memory */}
					<TextField
						fullWidth
						label="Memory (MB)"
						type="number"
						value={formData.memory}
						onChange={(e) => handleNumberChange("memory", Number(e.target.value))}
						error={!!errors.memory}
						helperText={errors.memory || "Minimum: 512 MB, Maximum: 16384 MB (16 GB)"}
						disabled={loading}
						inputProps={{
							min: 512,
							max: 16384,
							step: 512
						}}
					/>

					{/* Disk */}
					<TextField
						fullWidth
						label="Disk Size (GB)"
						type="number"
						value={formData.disk}
						onChange={(e) => handleNumberChange("disk", Number(e.target.value))}
						error={!!errors.disk}
						helperText={errors.disk || "Minimum: 8 GB, Maximum: 32 GB"}
						disabled={loading}
						inputProps={{
							min: 8,
							max: 32,
							step: 1
						}}
					/>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button
					onClick={handleClose}
					disabled={loading || approveLoading}
					startIcon={<X className="w-4 h-4" />}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="outlined"
					disabled={loading || approveLoading}
					startIcon={loading ? <CircularProgress size={16} /> : <Save className="w-4 h-4" />}
				>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
				{onApprove && (
					<Button
						onClick={handleApprove}
						variant="contained"
						color="success"
						disabled={loading || approveLoading}
						startIcon={approveLoading ? <CircularProgress size={16} /> : <Save className="w-4 h-4" />}
					>
						{approveLoading ? "Approving..." : "Save & Approve"}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};
