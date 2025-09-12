"use client";
import { cn } from "@midori/utils/format";
import { Search, X } from "lucide-react";

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	showClearButton?: boolean;
	disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder = "Search...",
	className,
	showClearButton = true,
	disabled = false,
}) => {
	const handleClear = () => {
		onChange("");
	};

	return (
		<div className={cn("relative", className)}>
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Search className="h-4 w-4 text-gray-400" />
			</div>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className={cn(
					"w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md",
					"focus:outline-none focus:ring-2 focus:ring-vm-blue-500 focus:border-transparent",
					"disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
					className
				)}
			/>
			{showClearButton && value && (
				<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
					<button
						type="button"
						onClick={handleClear}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
};

export default SearchInput;
