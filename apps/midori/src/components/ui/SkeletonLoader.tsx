"use client";
import { cn } from "@midori/utils/format";

export interface SkeletonLoaderProps {
	className?: string;
	variant?: "text" | "rectangular" | "circular";
	width?: string | number;
	height?: string | number;
	lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
	className,
	variant = "rectangular",
	width,
	height,
	lines = 1,
}) => {
	const baseClasses = "animate-pulse bg-gray-200 rounded";
	
	const variantClasses = {
		text: "h-4",
		rectangular: "h-4",
		circular: "rounded-full",
	};

	const style = {
		...(width && { width: typeof width === "number" ? `${width}px` : width }),
		...(height && { height: typeof height === "number" ? `${height}px` : height }),
	};

	if (lines > 1) {
		return (
			<div className={cn("space-y-2", className)}>
				{Array.from({ length: lines }).map((_, index) => (
					<div
						key={index}
						className={cn(baseClasses, variantClasses[variant])}
						style={index === lines - 1 ? { width: "75%" } : style}
					/>
				))}
			</div>
		);
	}

	return (
		<div
			className={cn(baseClasses, variantClasses[variant], className)}
			style={style}
		/>
	);
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
	<div className={cn("bg-white p-4 rounded-lg border border-gray-200", className)}>
		<div className="space-y-3">
			<SkeletonLoader height={20} width="75%" />
			<SkeletonLoader lines={2} />
			<div className="flex space-x-2">
				<SkeletonLoader height={24} width={60} />
				<SkeletonLoader height={24} width={80} />
			</div>
		</div>
	</div>
);

export const SkeletonListItem: React.FC<{ className?: string }> = ({ className }) => (
	<div className={cn("border border-gray-200 rounded-lg p-4", className)}>
		<div className="flex items-center justify-between">
			<div className="flex-1 space-y-2">
				<SkeletonLoader height={20} width="60%" />
				<SkeletonLoader height={16} width="40%" />
			</div>
			<div className="flex space-x-2">
				<SkeletonLoader height={24} width={60} />
				<SkeletonLoader height={24} width={24} variant="circular" />
			</div>
		</div>
	</div>
);

export default SkeletonLoader;
