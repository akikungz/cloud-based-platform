"use client";
import { cn } from "@midori/utils/format";

export interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
	text?: string;
	centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = "md",
	className,
	text,
	centered = false,
}) => {
	const sizeClasses = {
		sm: "h-4 w-4",
		md: "h-6 w-6", 
		lg: "h-8 w-8",
		xl: "h-12 w-12",
	};

	const spinner = (
		<div className={cn("animate-spin rounded-full border-b-2 border-vm-blue-500", sizeClasses[size], className)} />
	);

	if (text) {
		return (
			<div className={cn("flex flex-col items-center gap-2", centered && "justify-center min-h-32")}>
				{spinner}
				<p className="text-sm text-gray-600">{text}</p>
			</div>
		);
	}

	if (centered) {
		return (
			<div className="flex items-center justify-center min-h-32">
				{spinner}
			</div>
		);
	}

	return spinner;
};

export default LoadingSpinner;
