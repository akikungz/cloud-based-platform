"use client";
import { useState, useEffect } from "react";
import PendingRequest from "@midori/components/dashboard/PendingRequest";
import { RoleGuard } from "@midori/components/auth/RoleGuard";
import { Role } from "auth/utils/role";
import { PageHeader, SearchInput } from "@midori/components/ui";
import { momoi_client } from "@midori/libs/momoi";
import { Select, MenuItem, FormControl, InputLabel, Box, Button } from "@mui/material";
import { RefreshCw } from "lucide-react";

interface Course {
	id: number;
	course_id: string;
	course_title: string;
	main_staff: number;
	assistant_staff_1: number | null;
	assistant_staff_2: number | null;
	assistant_staff_3: number | null;
	created_at: Date;
	updated_at: Date;
	_count?: {
		instance_request: number;
		instance: number;
	};
}

export default function ApprovalsPage() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// Fetch courses for the current staff member
	const fetchCourses = async (isRefresh = false) => {
		if (isRefresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		try {
			const result = await momoi_client.api.v1.staff.course["my-courses"].get();
			if (result.error) {
				console.error("Failed to fetch courses:", result.error.value.message);
				return;
			}
			setCourses(result.data?.data || []);
		} catch (err) {
			console.error("Error fetching courses:", err);
		} finally {
			if (isRefresh) {
				setRefreshing(false);
			} else {
				setLoading(false);
			}
		}
	};

	// Handle refresh
	const handleRefresh = () => {
		fetchCourses(true);
		// Trigger refresh of the approval list
		setRefreshKey(prev => prev + 1);
	};

	useEffect(() => {
		fetchCourses();
	}, []);

	return (
		<RoleGuard allowedRoles={[Role.Staff]}>
			<div className="flex flex-col items-center justify-center gap-4">
				<div className="w-full flex items-center justify-between">
					<PageHeader
						title="Pending Approvals"
						description="Review and approve student requests for virtual machines."
					/>
					<Button
						variant="outlined"
						color="secondary"
						size="small"
						onClick={handleRefresh}
						disabled={refreshing}
						startIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />}
					>
						{refreshing ? "Refreshing..." : "Refresh"}
					</Button>
				</div>

				{/* Filters */}
				<Box className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
					{/* Course Filter */}
					<FormControl className="w-full" size="small">
						<InputLabel>Filter by Course</InputLabel>
						<Select
							value={selectedCourse}
							onChange={(e) => setSelectedCourse(e.target.value)}
							label="Filter by Course"
							disabled={loading}
						>
							<MenuItem value="">
								<em>All Courses</em>
							</MenuItem>
							{courses.map((course) => (
								<MenuItem key={course.id} value={course.course_id}>
									{course.course_id} - {course.course_title}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Search Filter */}
					<div className="w-full md:col-span-3">
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search by title or student name..."
						/>
					</div>
				</Box>

				{/* Pending Requests */}
				<div className="w-full">
					<PendingRequest
						key={refreshKey}
						limit={10}
						course={selectedCourse}
						searchQuery={searchQuery}
						showPagination={true}
					/>
				</div>
			</div>
		</RoleGuard>
	);
}
