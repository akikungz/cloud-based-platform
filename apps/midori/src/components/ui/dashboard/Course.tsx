"use client";
import { CourseItem, CourseItemSkeleton } from "@midori/components/ui/dashboard/CourseItem";
import { useLoading } from "@midori/contexts/loading";

export const Course = () => {
  const { isLoading } = useLoading();

  if (isLoading) {
    return Array.from({ length: 10 }).map((_, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: Using index as key for skeleton loading items
      <CourseItemSkeleton key={index} />
    ));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 p-4 bg-vm-orange-50 rounded-lg shadow-md">
      <CourseItem
        id="1"
        code="CS101"
        name="Introduction to Computer Science"
        main_staff={{ id: "1", name: "Alice", email: "alice@example.com" }}
        assistant_staff_1={{ id: "2", name: "Bob", email: "bob@example.com" }}
        assistant_staff_2={{ id: "3", name: "Charlie", email: "charlie@example.com" }}
        assistant_staff_3={null}
      />
      <CourseItem
        id="2"
        code="CS102"
        name="Data Structures and Algorithms"
        main_staff={{ id: "4", name: "David", email: "david@example.com" }}
        assistant_staff_1={{ id: "5", name: "Eve", email: "eve@example.com" }}
        assistant_staff_2={{ id: "6", name: "Frank", email: "frank@example.com" }}
        assistant_staff_3={null}
      />
    </div>
  );
}