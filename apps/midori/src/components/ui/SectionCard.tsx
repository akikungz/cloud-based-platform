"use client";
import { cn } from "@midori/utils/format";

export interface SectionCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	headerClassName?: string;
	contentClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
	title,
	description,
	children,
	className,
	headerClassName,
	contentClassName,
}) => {
	return (
		<div className={cn("w-full bg-white p-6 rounded-lg shadow-md", className)}>
			{(title || description) && (
				<div className={cn("mb-4", headerClassName)}>
					{title && (
						<h3 className="text-xl font-semibold text-vm-blue-900 mb-2">
							{title}
						</h3>
					)}
					{description && (
						<p className="text-vm-blue-600">{description}</p>
					)}
				</div>
			)}
			<div className={cn(contentClassName)}>
				{children}
			</div>
		</div>
	);
};

export default SectionCard;
