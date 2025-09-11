"use client";
import { cn } from "@midori/utils/format";

export interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	className?: string;
	onClick?: () => void;
	icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
	title,
	value,
	subtitle,
	className,
	onClick,
	icon,
}) => {
	return (
		<div
			className={cn(
				"border border-vm-blue-200 rounded-lg p-4 transition-shadow",
				onClick ? "hover:shadow-md cursor-pointer" : "",
				className
			)}
			onClick={onClick}
		>
			<div className="flex items-center justify-between mb-2">
				<h4 className="font-semibold text-vm-blue-900">{title}</h4>
				{icon && (
					<div className="text-vm-blue-600">
						{icon}
					</div>
				)}
			</div>
			<p className="text-2xl font-bold text-vm-blue-600 mb-1">{value}</p>
			{subtitle && (
				<p className="text-sm text-vm-blue-500">{subtitle}</p>
			)}
		</div>
	);
};

export default StatsCard;
