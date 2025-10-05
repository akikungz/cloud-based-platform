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

  describe("archiveInstance", () => {
    it("should archive an active instance", async () => {
      // Create an instance first
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Archive Instance",
        hostname: "test-archive-vm",
        description: "Instance to be archived",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      expect(createdInstance.id).toBeDefined();

      // Archive the instance
      const result = await StaffInstanceService.archiveInstance(createdInstance.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdInstance.id);
      expect(result.state).toBe("archived");
      expect(result.title).toBe("Test Archive Instance");
      expect(result.hostname).toBe("test-archive-vm");

      // Verify in database
      const dbInstance = await db.instance.findUnique({
        where: { id: createdInstance.id }
      });
      expect(dbInstance!.state).toBe("archived");
    });

    it("should throw error when archiving non-existent instance", async () => {
      await expect(StaffInstanceService.archiveInstance(999999))
        .rejects.toThrow("Instance not found or already deleted");
    });

    it("should throw error when archiving already archived instance", async () => {
      // Create and archive an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Double Archive",
        hostname: "test-double-archive-vm",
        description: "Instance to test double archive",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.archiveInstance(createdInstance.id);

      // Try to archive again
      await expect(StaffInstanceService.archiveInstance(createdInstance.id))
        .rejects.toThrow("Instance is already archived");
    });

    it("should not archive deleted instances", async () => {
      // Create and delete an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Archive Deleted",
        hostname: "test-archive-deleted-vm",
        description: "Deleted instance",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.deleteInstance(createdInstance.id);

      // Try to archive deleted instance
      await expect(StaffInstanceService.archiveInstance(createdInstance.id))
        .rejects.toThrow("Instance not found or already deleted");
    });
  });

  describe("unarchiveInstance", () => {
    it("should unarchive an archived instance", async () => {
      // Create and archive an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Unarchive Instance",
        hostname: "test-unarchive-vm",
        description: "Instance to be unarchived",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.archiveInstance(createdInstance.id);

      // Unarchive the instance
      const result = await StaffInstanceService.unarchiveInstance(createdInstance.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdInstance.id);
      expect(result.state).toBe("active");
      expect(result.title).toBe("Test Unarchive Instance");

      // Verify in database
      const dbInstance = await db.instance.findUnique({
        where: { id: createdInstance.id }
      });
      expect(dbInstance!.state).toBe("active");
    });

    it("should throw error when unarchiving non-archived instance", async () => {
      // Create an active instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Unarchive Active",
        hostname: "test-unarchive-active-vm",
        description: "Active instance",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);

      // Try to unarchive active instance
      await expect(StaffInstanceService.unarchiveInstance(createdInstance.id))
        .rejects.toThrow("Archived instance not found");
    });

    it("should throw error when unarchiving non-existent instance", async () => {
      await expect(StaffInstanceService.unarchiveInstance(999999))
        .rejects.toThrow("Archived instance not found");
    });
  });

  describe("deleteInstance", () => {
    it("should delete an instance", async () => {
      // Create an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Delete Instance",
        hostname: "test-delete-vm",
        description: "Instance to be deleted",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);

      // Delete the instance
      const result = await StaffInstanceService.deleteInstance(createdInstance.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(createdInstance.id);
      expect(result.state).toBe("deleted");
      expect(result.title).toBe("Test Delete Instance");
      expect(result.hostname).toBe("test-delete-vm");
      expect(result.vm_id).toBeDefined();
      expect(result.pve_node).toBeDefined();

      // Verify in database
      const dbInstance = await db.instance.findUnique({
        where: { id: createdInstance.id }
      });
      expect(dbInstance!.state).toBe("deleted");
    });

    it("should throw error when deleting non-existent instance", async () => {
      await expect(StaffInstanceService.deleteInstance(999999))
        .rejects.toThrow("Instance not found or already deleted");
    });

    it("should throw error when deleting already deleted instance", async () => {
      // Create and delete an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Double Delete",
        hostname: "test-double-delete-vm",
        description: "Instance to test double delete",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.deleteInstance(createdInstance.id);

      // Try to delete again
      await expect(StaffInstanceService.deleteInstance(createdInstance.id))
        .rejects.toThrow("Instance not found or already deleted");
    });

    it("should be able to delete archived instances", async () => {
      // Create and archive an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Delete Archived",
        hostname: "test-delete-archived-vm",
        description: "Archived instance to be deleted",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.archiveInstance(createdInstance.id);

      // Delete the archived instance
      const result = await StaffInstanceService.deleteInstance(createdInstance.id);

      expect(result).toBeDefined();
      expect(result.state).toBe("deleted");

      // Verify in database
      const dbInstance = await db.instance.findUnique({
        where: { id: createdInstance.id }
      });
      expect(dbInstance!.state).toBe("deleted");
    });
  });

  describe("changeVMStatus", () => {
    it("should change VM status to start", async () => {
      // Create an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Status Change",
        hostname: "test-status-vm",
        description: "Instance for status change",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);

      // Change status to start
      const result = await StaffInstanceService.changeVMStatus(createdInstance.id, 'start');

      expect(result).toBeDefined();
      expect(result.id).toBe(createdInstance.id);
      expect(result.status).toBe("running");
      expect(result.action).toBe("start");
      expect(result.vm_id).toBeDefined();
      expect(result.pve_node).toBeDefined();

      // Verify in database
      const dbInstance = await db.instance.findUnique({
        where: { id: createdInstance.id }
      });
      expect(dbInstance!.status).toBe("running");
    });

    it("should change VM status to stop", async () => {
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Stop Status",
        hostname: "test-stop-vm",
        description: "Instance for stop test",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);

      // Change status to stop
      const result = await StaffInstanceService.changeVMStatus(createdInstance.id, 'stop');

      expect(result).toBeDefined();
      expect(result.status).toBe("stopped");
      expect(result.action).toBe("stop");
    });

    it("should change VM status to reboot", async () => {
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Reboot Status",
        hostname: "test-reboot-vm",
        description: "Instance for reboot test",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);

      // Change status to reboot
      const result = await StaffInstanceService.changeVMStatus(createdInstance.id, 'reboot');

      expect(result).toBeDefined();
      expect(result.status).toBe("running");
      expect(result.action).toBe("reboot");
    });

    it("should throw error when changing status of non-existent instance", async () => {
      await expect(StaffInstanceService.changeVMStatus(999999, 'start'))
        .rejects.toThrow("Instance not found or deleted");
    });

    it("should throw error when changing status of deleted instance", async () => {
      // Create and delete an instance
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const instanceData = {
        user_id: user!.id,
        title: "Test Status Deleted",
        hostname: "test-status-deleted-vm",
        description: "Deleted instance",
        type: "course" as const,
        course_id: course!.id,
        template_id: template!.id,
        cpus: 2,
        memory: 2048,
        disk: 20
      };

      const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
      await StaffInstanceService.deleteInstance(createdInstance.id);

      // Try to change status
      await expect(StaffInstanceService.changeVMStatus(createdInstance.id, 'start'))
        .rejects.toThrow("Instance not found or deleted");
    });

    it("should handle all status actions correctly", async () => {
      const user = await db.user.findFirst();
      const course = await db.instance_course.findFirst();
      const template = await db.instance_template.findFirst();

      const actions: Array<'start' | 'stop' | 'suspend' | 'resume' | 'reboot'> = 
        ['start', 'stop', 'suspend', 'resume', 'reboot'];

      for (const action of actions) {
        const instanceData = {
          user_id: user!.id,
          title: `Test ${action} Status`,
          hostname: `test-${action}-vm`,
          description: `Instance for ${action} test`,
          type: "course" as const,
          course_id: course!.id,
          template_id: template!.id,
          cpus: 2,
          memory: 2048,
          disk: 20
        };

        const createdInstance = await StaffInstanceService.createInstanceDirectly(instanceData);
        const result = await StaffInstanceService.changeVMStatus(createdInstance.id, action);

        expect(result).toBeDefined();
        expect(result.action).toBe(action);
        expect(result.status).toBeDefined();
      }
    });
  });
});
