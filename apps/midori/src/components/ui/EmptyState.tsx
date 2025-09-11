"use client";
import { cn } from "@midori/utils/format";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
	icon?: LucideIcon;
	title?: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	icon: Icon,
	title = "No data found",
	description = "There's nothing to display at the moment.",
	action,
	className,
}) => {
	return (
		<div className={cn(
			"flex flex-col items-center justify-center text-gray-500 flex-1 py-8",
			className
		)}>
			{Icon && (
				<Icon className="w-12 h-12 mb-4 text-gray-400" />
			)}
			<h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
			<p className="text-sm text-gray-600 mb-4 text-center max-w-sm">{description}</p>
			{action && (
				<div className="mt-2">
					{action}
				</div>
			)}
		</div>
	);
};

export default EmptyState;
