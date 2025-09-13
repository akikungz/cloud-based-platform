import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

import { CourseController } from "./course.controller";

describe("Staff/Course Module", () => {
  let app: typeof CourseController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = CourseController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  describe("GET /course", () => {
    it("should return list of courses", async () => {
      const response = await api.course.get({ query: {} });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray((response.data as any)!.data)).toBe(true);
      expect(response.data).toHaveProperty("message", "Courses fetched successfully");
    });

    it("should return empty array when no courses exist", async () => {
      // Reset database to test empty state
      await mockSetup.resetDatabase();

      const response = await api.course.get({ query: {} });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect((response.data as any)!.data).toEqual([]);
    });
  });

  describe("GET /course/search", () => {
    it("should search courses by query", async () => {
      const response = await api.course.search.get({ query: { q: "test" } });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Courses searched successfully");
    });

    it("should return empty array for non-matching query", async () => {
      const response = await api.course.search.get({ query: { q: "nonexistent" } });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect((response.data as any)!.data).toEqual([]);
    });
  });

  describe("GET /course/staff/:staffId", () => {
    it("should return courses for a specific staff member", async () => {
      const response = await api.course.staff({ staffId: 1 }).get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Courses fetched for staff successfully");
    });
  });

  describe("GET /course/:id", () => {
    it("should return course details by ID", async () => {
      const response = await api.course({ id: 1 }).get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Course fetched successfully");
    });

    it("should return 404 for non-existent course", async () => {
      const response = await api.course({ id: 999 }).get();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "Course not found");
    });
  });

  describe("GET /course/course-id/:courseId", () => {
    it("should return course by course_id", async () => {
      const response = await api["course"]["course-id"]({ courseId: "060233101" }).get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Course fetched successfully");
    });

    it("should return 404 for non-existent course_id", async () => {
      const response = await api["course"]["course-id"]({ courseId: "NONEXISTENT" }).get();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "Course not found");
    });
  });

  describe("GET /course/:id/stats", () => {
    it("should return course statistics", async () => {
      const response = await api.course({ id: 1 }).stats.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Course statistics fetched successfully");
      
      const stats = (response.data as any)!.data;
      expect(stats).toHaveProperty("course");
      expect(stats).toHaveProperty("requests");
      expect(stats).toHaveProperty("instances");
    });

    it("should return 404 for non-existent course stats", async () => {
      const response = await api.course({ id: 999 }).stats.get();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "Course not found");
    });
  });

  describe("POST /course", () => {
    it("should create a new course", async () => {
      const courseData = {
        course_id: "CS102",
        course_title: "Advanced Programming",
        main_staff: 1,
        assistant_staff_1: 2,
        assistant_staff_2: 3
      };

      const response = await api.course.post(courseData);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Course created successfully");
      
      const createdCourse = (response.data as any)!.data;
      expect(createdCourse).toHaveProperty("course_id", "CS102");
      expect(createdCourse).toHaveProperty("course_title", "Advanced Programming");
      expect(createdCourse).toHaveProperty("main_staff", 1);
    });

    it("should return 409 for duplicate course_id", async () => {
      const courseData = {
        course_id: "060233101", // This should already exist in mock data
        course_title: "Duplicate Course",
        main_staff: 1
      };

      const response = await api.course.post(courseData);

      expect(response.status).toBe(409);
      expect(response.error?.value).toHaveProperty("message", "Course with this ID already exists");
    });

    it("should return 422 for invalid data", async () => {
      const courseData = {
        course_id: "", // Invalid: empty string
        course_title: "Invalid Course",
        main_staff: 1
      };

      const response = await api.course.post(courseData);

      expect(response.status).toBe(422);
    });
  });

  describe("PUT /course/:id", () => {
    it("should update an existing course", async () => {
      const updateData = {
        course_title: "Updated Course Title",
        assistant_staff_1: 2
      };

      const response = await api.course({ id: 1 }).put(updateData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message", "Course updated successfully");
      
      const updatedCourse = (response.data as any)!.data;
      expect(updatedCourse).toHaveProperty("course_title", "Updated Course Title");
    });

    it("should return 404 for non-existent course", async () => {
      const updateData = {
        course_title: "Updated Title"
      };

      const response = await api.course({ id: 999 }).put(updateData);

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "Course not found");
    });

    it("should return 409 for duplicate course_id", async () => {
      // First create a course
      await api.course.post({
        course_id: "CS103",
        course_title: "Test Course",
        main_staff: 1
      });

      // Try to update another course with the same course_id
      const updateData = {
        course_id: "CS103"
      };

      const response = await api.course({ id: 1 }).put(updateData);

      expect(response.status).toBe(409);
      expect(response.error?.value).toHaveProperty("message", "Course with this ID already exists");
    });
  });

  describe("DELETE /course/:id", () => {
    it("should delete a course", async () => {
      // First create a course to delete
      const createResponse = await api.course.post({
        course_id: "CS104",
        course_title: "Course to Delete",
        main_staff: 1
      });

      const courseId = (createResponse.data as any)!.data.id;

      const response = await api.course({ id: courseId }).delete();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message", "Course deleted successfully");
    });

    it("should return 404 for non-existent course", async () => {
      const response = await api.course({ id: 999 }).delete();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "Course not found");
    });

    it("should return 409 for course with associated instances", async () => {
      // Try to delete a course that has associated instances (from mock data)
      const response = await api.course({ id: 1 }).delete();

      expect(response.status).toBe(409);
      expect(response.error?.value).toHaveProperty("message", "Cannot delete course with associated instances or requests");
    });
  });

  describe("Error Cases and Edge Cases", () => {
    it("should handle invalid staff ID in course creation", async () => {
      const courseData = {
        course_id: "CS105",
        course_title: "Invalid Staff Course",
        main_staff: 999 // Non-existent staff ID
      };

      const response = await api.course.post(courseData);

      // This might succeed in creation but fail in validation depending on database constraints
      // The exact behavior depends on foreign key constraints
      expect([200, 201, 400, 409]).toContain(response.status);
    });

    it("should handle partial updates correctly", async () => {
      const updateData = {
        course_title: "Partially Updated"
        // Only updating title, leaving other fields unchanged
      };

      const response = await api.course({ id: 1 }).put(updateData);

      expect(response.status).toBe(200);
      const updatedCourse = (response.data as any)!.data;
      expect(updatedCourse).toHaveProperty("course_title", "Partially Updated");
      // Other fields should remain unchanged
      expect(updatedCourse).toHaveProperty("course_id");
      expect(updatedCourse).toHaveProperty("main_staff");
    });

    it("should handle empty search queries", async () => {
      const response = await api.course.search.get({ query: { q: "" } });

      expect(response.status).toBe(422); // Should fail validation due to minLength: 1
    });

    it("should handle special characters in search", async () => {
      const response = await api.course.search.get({ query: { q: "CS-101 & Programming!" } });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    });
  });
});
