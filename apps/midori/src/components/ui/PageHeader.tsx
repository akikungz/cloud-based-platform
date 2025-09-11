"use client";
import { cn } from "@midori/utils/format";

export interface PageHeaderProps {
	title: string;
	description: string;
	className?: string;
	children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	description,
	className,
	children,
}) => {
	return (
		<div className={cn("flex flex-col w-full px-2 pt-2", className)}>
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<h2 className="text-3xl font-semibold">{title}</h2>
					<p className="text-vm-blue-600">{description}</p>
				</div>
				{children && (
					<div className="flex items-center gap-2">
						{children}
					</div>
				)}
			</div>
		</div>
	);
};

export default PageHeader;
