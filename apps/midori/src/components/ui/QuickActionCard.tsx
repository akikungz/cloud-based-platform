"use client";
import { cn } from "@midori/utils/format";

export interface QuickActionCardProps {
	title: string;
	description: string;
	onClick?: () => void;
	className?: string;
	icon?: React.ReactNode;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
	title,
	description,
	onClick,
	className,
	icon,
}) => {
	return (
		<div
			className={cn(
				"p-4 border border-vm-blue-200 rounded-lg transition-colors cursor-pointer",
				"hover:bg-vm-blue-50",
				className
			)}
			onClick={onClick}
		>
			<div className="flex items-start gap-3">
				{icon && (
					<div className="text-vm-blue-600 mt-1">
						{icon}
					</div>
				)}
				<div className="flex-1">
					<h4 className="font-medium text-vm-blue-900 mb-1">{title}</h4>
					<p className="text-sm text-vm-blue-600">{description}</p>
				</div>
			</div>
		</div>
	);
};

export default QuickActionCard;
