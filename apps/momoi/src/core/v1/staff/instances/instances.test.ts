import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { StaffInstanceService } from "./instances.service";
import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

describe("Staff Instance Service", () => {
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  afterEach(async () => {
    await mockSetup.resetDatabase();
  });

  describe("createInstanceDirectly", () => {
    it("should create an instance directly without request or semester lock", async () => {
      // Get a user from the mock data
      const user = await db.user.findFirst();
      expect(user).toBeDefined();

      // Get a course from the mock data
      const course = await db.instance_course.findFirst();
      expect(course).toBeDefined();

      // Get a template from the mock data
      const template = await db.instance_template.findFirst();
      expect(template).toBeDefined();

      const instanceData = {
        user_id: user!.id,
        title: "Test Staff Instance",
        hostname: "test-staff-vm",
        description: "A test instance created by staff",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20,
        semester_id: undefined // Test without semester
      };

      const result = await StaffInstanceService.createInstanceDirectly(instanceData);

      expect(result).toBeDefined();
      expect(result.title).toBe("Test Staff Instance");
      expect(result.hostname).toBe("test-staff-vm");
      expect(result.type).toBe("course");
      expect(result.cpus).toBe(2);
      expect(result.memory).toBe(2048);
      expect(result.disk).toBe(20);
      expect(result.user.id).toBe(user!.id);
      expect(result.course.id).toBe(course!.id);
      expect(result.template.id).toBe(template!.id);

      // Verify the instance was created in the database
      const createdInstance = await db.instance.findUnique({
        where: { id: result.id },
        include: {
          user: true,
          course: true,
          template: true,
          semester: true
        }
      });

      expect(createdInstance).toBeDefined();
      expect(createdInstance!.title).toBe("Test Staff Instance");
      expect(createdInstance!.state).toBe("active");
      expect(createdInstance!.status).toBe("pending");
    });

    it("should create an instance with a specific semester", async () => {
      // Get a user from the mock data
      const user = await db.user.findFirst();
      expect(user).toBeDefined();

      // Get a course from the mock data
      const course = await db.instance_course.findFirst();
      expect(course).toBeDefined();

      // Get a template from the mock data
      const template = await db.instance_template.findFirst();
      expect(template).toBeDefined();

      // Get a semester from the mock data
      const semester = await db.semester.findFirst();
      expect(semester).toBeDefined();

      const instanceData = {
        user_id: user!.id,
        title: "Test Staff Instance with Semester",
        hostname: "test-staff-vm-semester",
        description: "A test instance created by staff with semester",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 4,
        memory: 4096,
        disk: 40,
        semester_id: semester!.id
      };

      const result = await StaffInstanceService.createInstanceDirectly(instanceData);

      expect(result).toBeDefined();
      expect(result.semester).toBeDefined();
      expect(result.semester!.id).toBe(semester!.id);
      expect(result.semester!.name).toBe(semester!.name);
    });

    it("should throw error for non-existent user", async () => {
      const instanceData = {
        user_id: "non-existent-user",
        title: "Test Instance",
        hostname: "test-vm",
        description: "Test description",
        type: "course" as const,
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      await expect(StaffInstanceService.createInstanceDirectly(instanceData))
        .rejects.toThrow("User not found");
    });

    it("should throw error for non-existent course", async () => {
      const user = await db.user.findFirst();
      expect(user).toBeDefined();

      const instanceData = {
        user_id: user!.id,
        title: "Test Instance",
        hostname: "test-vm",
        description: "Test description",
        type: "course" as const,
        course_id: 999, // Non-existent course
        template_id: 1,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      await expect(StaffInstanceService.createInstanceDirectly(instanceData))
        .rejects.toThrow("Course not found");
    });

    it("should throw error for non-existent template", async () => {
      const user = await db.user.findFirst();
      expect(user).toBeDefined();

      const course = await db.instance_course.findFirst();
      expect(course).toBeDefined();

      const instanceData = {
        user_id: user!.id,
        title: "Test Instance",
        hostname: "test-vm",
        description: "Test description",
        type: "course" as const,
        course_id: course!.id,
        template_id: 999, // Non-existent template
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      await expect(StaffInstanceService.createInstanceDirectly(instanceData))
        .rejects.toThrow("Template not found");
    });

    it("should throw error for duplicate hostname", async () => {
      const user = await db.user.findFirst();
      expect(user).toBeDefined();

      const course = await db.instance_course.findFirst();
      expect(course).toBeDefined();

      const template = await db.instance_template.findFirst();
      expect(template).toBeDefined();

      const instanceData = {
        user_id: user!.id,
        title: "Test Instance",
        hostname: "duplicate-hostname",
        description: "Test description",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      // Create first instance
      await StaffInstanceService.createInstanceDirectly(instanceData);

      // Try to create second instance with same hostname
      await expect(StaffInstanceService.createInstanceDirectly(instanceData))
        .rejects.toThrow("Instance with this hostname already exists for this user");
    });
  });

  describe("getAvailableTemplates", () => {
    it("should return available templates", async () => {
      const templates = await StaffInstanceService.getAvailableTemplates();

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      const template = templates[0];
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("os_name");
      expect(template).toHaveProperty("vm_type");
      expect(template).toHaveProperty("based_size");
      expect(template).toHaveProperty("host_name");
      expect(template).toHaveProperty("host_status");
    });
  });

  describe("getAvailableCourses", () => {
    it("should return available courses", async () => {
      const courses = await StaffInstanceService.getAvailableCourses();

      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);

      const course = courses[0];
      expect(course).toHaveProperty("id");
      expect(course).toHaveProperty("course_id");
      expect(course).toHaveProperty("course_title");
      expect(course).toHaveProperty("main_staff");
    });
  });

  describe("getAvailableSemesters", () => {
    it("should return available semesters", async () => {
      const semesters = await StaffInstanceService.getAvailableSemesters();

      expect(semesters).toBeDefined();
      expect(Array.isArray(semesters)).toBe(true);
      expect(semesters.length).toBeGreaterThan(0);

      const semester = semesters[0];
      expect(semester).toHaveProperty("id");
      expect(semester).toHaveProperty("name");
      expect(semester).toHaveProperty("start_at");
      expect(semester).toHaveProperty("end_at");
      expect(semester).toHaveProperty("active");
    });
  });
});
