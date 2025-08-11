"use client";
import { Course } from "@midori/components/ui/dashboard/Course";
import { CourseAdd } from "@midori/components/ui/dashboard/CourseAdd";
import { LoadingProvider } from "@midori/contexts/loading";
import { StaffProvider } from "@midori/contexts/staffList";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import { useState } from "react";

export const CoursesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p>Manage your courses here.</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} startIcon={<AddIcon />}>
          Add Course
        </Button>
      </div>
      {/* Additional course management components can be added here */}
      <LoadingProvider>
        <StaffProvider>
          <CourseAdd isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          <Course />
        </StaffProvider>
      </LoadingProvider>
    </div>
  )
}

export default CoursesPage;
