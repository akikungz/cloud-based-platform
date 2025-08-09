"use client";
import { PendingRequest } from "@midori/components/ui/dashboard/PendingRequest";
import { PendingItemProvider } from "@midori/contexts/staff/pendingItem";
import { MenuItem, Pagination, Select, Stack, TextField } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export const Approval = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const limit = useMemo(() => {
    if (!searchParams) return 10;
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam, 10) : 10;
  }, [searchParams]);

  const page = useMemo(() => {
    if (!searchParams) return 1;
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  }, [searchParams]);

  const course = useMemo(() => {
    if (!searchParams) return "All";
    return searchParams.get("course") || "All";
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return handlePageChange(1); // Prevent going to a negative page
    if (!searchParams) return;
    // Set the new page in the search params
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage.toString());

    // Update the URL with the new search params
    router.replace(`?${newSearchParams.toString()}`);
  }

  const handleLimitChange = (newLimit: number) => {
    if (!searchParams) return;
    // Set the new limit in the search params
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit.toString());

    // Update the URL with the new search params
    router.replace(`?${newSearchParams.toString()}`);
  }

  const handleCourseChange = (newCourse: string) => {
    if (!searchParams) return;
    // Set the new course in the search params
    const newSearchParams = new URLSearchParams(searchParams.toString());
    switch (newCourse) {
      case "All":
        newSearchParams.delete("course");
        break;
      default:
        newSearchParams.set("course", newCourse);
        break;
    }

    // Update the URL with the new search params
    router.replace(`?${newSearchParams.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-2 pt-2 flex-wrap lg:flex-nowrap gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-semibold">Approval Requests</h2>
          <p className="text-vm-blue-600">
            Review and manage all pending approval requests efficiently.
          </p>
        </div>

        <Stack 
          flex="1"
          direction="row"
          spacing={2}
          justifyItems="flex-end"
          alignItems="center"
          className="md:flex-1 lg:flex-none"
        >
          {/* Search field */}
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Course filter */}
          <Select
            size="small"
            value={course}
            onChange={(e) => handleCourseChange(e.target.value as string)}
            className="w-48"
            
          >
            <MenuItem value="All">All Courses</MenuItem>
            <MenuItem value="060233101">Course 1</MenuItem>
            <MenuItem value="060233102">Course 2</MenuItem>
            {/* Add more courses as needed */}
          </Select>

          {/* Limit selector */}
          <Select
            size="small"
            value={limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="w-24"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Stack>
      </div>

      <PendingItemProvider>
        <PendingRequest
          limit={limit}
          page={page}
          course={course}
          searchQuery={searchQuery}
        />
      </PendingItemProvider>

      {/* Pagination Controls */}
      <Pagination
        count={10} // Assuming a fixed number of pages for simplicity
        page={page}
        onChange={(_, value) => handlePageChange(value)}
        variant="outlined"
        shape="rounded"
        color="primary"
        className="self-end items-end"
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default Approval;