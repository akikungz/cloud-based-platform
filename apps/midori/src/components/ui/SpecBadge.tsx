"use client";
import { cn } from "@midori/utils/format";
import { LucideIcon } from "lucide-react";

export interface SpecBadgeProps {
	icon: LucideIcon;
	label: string;
	variant?: "blue" | "orange" | "green" | "gray";
	className?: string;
}

export const SpecBadge: React.FC<SpecBadgeProps> = ({
	icon: Icon,
	label,
	variant = "blue",
	className,
}) => {
	const variantClasses = {
		blue: "bg-vm-blue-100 text-vm-blue-700",
		orange: "bg-vm-orange-100 text-vm-orange-700",
		green: "bg-green-100 text-green-700",
		gray: "bg-gray-100 text-gray-700",
	};

	const iconClasses = {
		blue: "text-vm-blue-600",
		orange: "text-vm-orange-600",
		green: "text-green-600",
		gray: "text-gray-600",
	};

	return (
		<div className={cn(
			"flex items-center gap-1 text-xs px-2 py-1 rounded",
			variantClasses[variant],
			className
		)}>
			<Icon className={cn("w-3 h-3", iconClasses[variant])} />
			<span>{label}</span>
		</div>
	);
};

export default SpecBadge;
