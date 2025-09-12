"use client";
import { cn } from "@midori/utils/format";
import { Search, X } from "lucide-react";

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onSearch?: () => void;
	placeholder?: string;
	className?: string;
	showClearButton?: boolean;
	showSearchButton?: boolean;
	disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	onSearch,
	placeholder = "Search...",
	className,
	showClearButton = true,
	showSearchButton = false,
	disabled = false,
}) => {
	const handleClear = () => {
		onChange("");
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && onSearch) {
			onSearch();
		}
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
				onKeyPress={handleKeyPress}
				placeholder={placeholder}
				disabled={disabled}
				className={cn(
					"w-full pl-10 py-2 border border-gray-300 rounded-md",
					"focus:outline-none focus:ring-2 focus:ring-vm-blue-500 focus:border-transparent",
					"disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
					showSearchButton ? "pr-20" : "pr-10",
					className
				)}
			/>
			{showSearchButton && onSearch && (
				<div className="absolute inset-y-0 right-0 pr-1 flex items-center">
					<button
						type="button"
						onClick={onSearch}
						disabled={disabled}
						className="px-3 py-1 bg-vm-blue-600 text-white rounded-md hover:bg-vm-blue-700 focus:outline-none focus:ring-2 focus:ring-vm-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
						aria-label="Search"
					>
						<Search className="h-3 w-3" />
						<span className="text-sm">Search</span>
					</button>
				</div>
			)}
			{showClearButton && value && !showSearchButton && (
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
