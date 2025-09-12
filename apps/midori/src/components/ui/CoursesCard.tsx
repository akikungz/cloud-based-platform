"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "./card";
import { cn } from "@midori/utils/format";
import { Book } from "lucide-react";

export interface Course {
	id: number;
	course_id: string;
	course_title: string;
	main_staff?: {
		id: number;
		name: string;
		email: string;
	};
}

export interface CoursesCardProps {
	title: string;
	courses: Course[];
	icon: React.ReactNode;
	className?: string;
	loading?: boolean;
	error?: string;
}

export const CoursesCard: React.FC<CoursesCardProps> = ({
	title,
	courses,
	icon,
	className,
	loading = false,
	error,
}) => {
	if (loading) {
		return (
			<Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-vm-blue-200">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-vm-blue-700">
						{title}
					</CardTitle>
					<div className={cn("p-2 rounded", className)}>{icon}</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-vm-blue-900 mb-1">...</div>
					<p className="text-xs text-vm-blue-600">Loading courses...</p>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-vm-blue-200">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-vm-blue-700">
						{title}
					</CardTitle>
					<div className={cn("p-2 rounded", className)}>{icon}</div>
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-vm-blue-900 mb-1">0</div>
					<p className="text-xs text-red-600">Error loading courses</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-vm-blue-200">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-vm-blue-700">
					{title}
				</CardTitle>
				<div className={cn("p-2 rounded", className)}>{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold text-vm-blue-900 mb-1">{courses.length}</div>
				<p className="text-xs text-vm-blue-600 mb-2">
					{courses.length === 1 ? 'Course' : 'Courses'}
				</p>
			</CardContent>
		</Card>
	);
};

export default CoursesCard;
