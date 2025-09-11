"use client";
import { CircularProgress, Box } from "@mui/material";

interface FullScreenLoadingProps {
	isLoading: boolean;
	children: React.ReactNode;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
	isLoading,
	children,
}) => {
	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					backgroundColor: "background.default",
				}}
			>
				<CircularProgress size={60} />
			</Box>
		);
	}

	return <>{children}</>;
};

export default FullScreenLoading;
