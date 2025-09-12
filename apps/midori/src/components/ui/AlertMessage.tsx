"use client";
import { cn } from "@midori/utils/format";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertMessageProps {
	type: AlertType;
	title?: string;
	message: string;
	dismissible?: boolean;
	onDismiss?: () => void;
	className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
	type,
	title,
	message,
	dismissible = false,
	onDismiss,
	className,
}) => {
	const typeConfig = {
		success: {
			bgColor: "bg-green-50",
			borderColor: "border-green-200",
			textColor: "text-green-700",
			icon: CheckCircle,
			iconColor: "text-green-500",
		},
		error: {
			bgColor: "bg-red-50",
			borderColor: "border-red-200", 
			textColor: "text-red-700",
			icon: XCircle,
			iconColor: "text-red-500",
		},
		warning: {
			bgColor: "bg-yellow-50",
			borderColor: "border-yellow-200",
			textColor: "text-yellow-700", 
			icon: AlertCircle,
			iconColor: "text-yellow-500",
		},
		info: {
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
			textColor: "text-blue-700",
			icon: Info,
			iconColor: "text-blue-500",
		},
	};

	const config = typeConfig[type];
	const Icon = config.icon;

	return (
		<div className={cn(
			"px-4 py-3 rounded border flex items-start justify-between",
			config.bgColor,
			config.borderColor,
			className
		)}>
			<div className="flex items-start">
				<Icon className={cn("h-5 w-5 mr-2 mt-0.5 flex-shrink-0", config.iconColor)} />
				<div className="flex-1">
					{title && (
						<h4 className={cn("font-medium mb-1", config.textColor)}>
							{title}
						</h4>
					)}
					<p className={cn("text-sm", config.textColor)}>
						{message}
					</p>
				</div>
			</div>
			{dismissible && onDismiss && (
				<button
					onClick={onDismiss}
					className={cn(
						"ml-2 flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors",
						config.textColor
					)}
					aria-label="Dismiss alert"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
};

export default AlertMessage;
