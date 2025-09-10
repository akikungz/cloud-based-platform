import { describe, expect, it, beforeEach } from "bun:test";
import { prisma } from "database";
import { 
  createPrismaMockSetup, 
  createPrismaTestHelpers,
  PrismaTestScenarios 
} from "./index";

describe("Prisma Mock System Integration", () => {
  let db: ReturnType<typeof prisma>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;
  let testScenarios: PrismaTestScenarios;

  beforeEach(async () => {
    // Initialize database connection
    db = prisma();
    
    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);
    testScenarios = testHelpers.getTestScenarios();
  });

  describe("Database Connection", () => {
    it("should connect to database successfully", async () => {
      // Test basic database connectivity
      const result = await db.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });
  });

  describe("Mock Setup", () => {
    it("should setup basic data without errors", async () => {
      await expect(async () => {
        await mockSetup.setupBasicData();
      }).not.toThrow();
    });

    it("should reset database without errors", async () => {
      // First setup some data
      await mockSetup.setupBasicData();
      
      // Then reset it
      await expect(async () => {
        await mockSetup.resetDatabase();
      }).not.toThrow();
    });

    it("should setup complete test environment", async () => {
      await expect(async () => {
        await mockSetup.setupCompleteTestEnvironment();
      }).not.toThrow();
    });
  });

  describe("Test Scenarios", () => {
    it("should setup student with active instance scenario", async () => {
      await expect(async () => {
        await testScenarios.studentWithActiveInstance();
      }).not.toThrow();
    });

    it("should setup student with pending request scenario", async () => {
      await expect(async () => {
        await testScenarios.studentWithPendingRequest();
      }).not.toThrow();
    });

    it("should setup staff with multiple courses scenario", async () => {
      await expect(async () => {
        await testScenarios.staffWithMultipleCourses();
      }).not.toThrow();
    });
  });

  describe("Test Helpers", () => {
    beforeEach(async () => {
      await mockSetup.setupCompleteTestEnvironment();
    });

    it("should create custom test user", async () => {
      const customUser = await testHelpers.createTestUser({
        email: "integration-test@example.com",
        name: "Integration Test User",
      });

      expect(customUser).toBeDefined();
      expect(customUser.email).toBe("integration-test@example.com");
      expect(customUser.name).toBe("Integration Test User");
    });

    it("should get user instances", async () => {
      const userInstances = await testHelpers.getUserInstances("test-student-id");
      expect(Array.isArray(userInstances)).toBe(true);
    });

    it("should get active instances", async () => {
      const activeInstances = await testHelpers.getActiveInstances();
      expect(Array.isArray(activeInstances)).toBe(true);
    });

    it("should get pending instance requests", async () => {
      const pendingRequests = await testHelpers.getPendingInstanceRequests();
      expect(Array.isArray(pendingRequests)).toBe(true);
    });

    it("should get available IP addresses", async () => {
      const availableIps = await testHelpers.getAvailableIpAddresses();
      expect(Array.isArray(availableIps)).toBe(true);
    });

    it("should get online PVE nodes", async () => {
      const onlineNodes = await testHelpers.getOnlinePveNodes();
      expect(Array.isArray(onlineNodes)).toBe(true);
    });

    it("should get current semester", async () => {
      const currentSemester = await testHelpers.getCurrentSemester();
      expect(currentSemester).toBeDefined();
      expect(currentSemester?.active).toBe(true);
    });
  });

  describe("Data Validation", () => {
    beforeEach(async () => {
      await mockSetup.setupCompleteTestEnvironment();
    });

    it("should have test users created", async () => {
      const users = await db.user.findMany({
        where: { id: { startsWith: "test-" } },
      });
      expect(users.length).toBeGreaterThan(0);
    });

    it("should have staff list created", async () => {
      const staff = await db.staff_list.findMany();
      expect(staff.length).toBeGreaterThan(0);
    });

    it("should have instance courses created", async () => {
      const courses = await db.instance_course.findMany();
      expect(courses.length).toBeGreaterThan(0);
    });

    it("should have PVE nodes created", async () => {
      const nodes = await db.pve_node.findMany();
      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should have instance templates created", async () => {
      const templates = await db.instance_template.findMany();
      expect(templates.length).toBeGreaterThan(0);
    });

    it("should have networks created", async () => {
      const networks = await db.network.findMany();
      expect(networks.length).toBeGreaterThan(0);
    });

    it("should have IP addresses created", async () => {
      const ipAddresses = await db.ip_address.findMany();
      expect(ipAddresses.length).toBeGreaterThan(0);
    });

    it("should have semesters created", async () => {
      const semesters = await db.semester.findMany();
      expect(semesters.length).toBeGreaterThan(0);
    });

    it("should have instances created", async () => {
      const instances = await db.instance.findMany();
      expect(instances.length).toBeGreaterThan(0);
    });

    it("should have instance requests created", async () => {
      const requests = await db.instance_request.findMany();
      expect(requests.length).toBeGreaterThan(0);
    });
  });

  describe("Cleanup", () => {
    it("should cleanup test data", async () => {
      // Setup test data
      await mockSetup.setupCompleteTestEnvironment();
      
      // Create additional test data
      await testHelpers.createTestUser({ email: "cleanup-test@example.com" });
      
      // Verify data exists
      const usersBeforeCleanup = await db.user.findMany({
        where: { id: { startsWith: "test-" } },
      });
      expect(usersBeforeCleanup.length).toBeGreaterThan(0);
      
      // Cleanup
      await testHelpers.cleanupTestData();
      
      // Verify cleanup worked
      const usersAfterCleanup = await db.user.findMany({
        where: { id: { startsWith: "test-" } },
      });
      expect(usersAfterCleanup.length).toBe(0);
    });
  });
});
