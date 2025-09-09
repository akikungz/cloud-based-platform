import { describe, expect, it, beforeEach } from "bun:test";
import type { PrismaDB } from "database";
import { 
  createPrismaMockSetup, 
  createPrismaTestHelpers,
  PrismaTestScenarios,
  PrismaTestAssertions 
} from "./index";

// This is an example test file showing how to use the Prisma mock system
// Replace with your actual database instance
const db = {} as PrismaDB; // Replace with actual db instance

describe("Prisma Mock System - Example Usage", () => {
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;
  let testScenarios: PrismaTestScenarios;

  beforeEach(async () => {
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);
    testScenarios = testHelpers.getTestScenarios();
  });

  describe("Basic Mock Setup", () => {
    it("should setup complete test environment", async () => {
      await mockSetup.setupCompleteTestEnvironment();

      // Verify users were created
      const users = await testHelpers.getDb().user.findMany();
      expect(users.length).toBeGreaterThan(0);

      // Verify staff list was created
      const staff = await testHelpers.getAllStaff();
      expect(staff.length).toBeGreaterThan(0);

      // Verify courses were created
      const courses = await testHelpers.getDb().instance_course.findMany();
      expect(courses.length).toBeGreaterThan(0);
    });

    it("should reset database properly", async () => {
      // First setup some data
      await mockSetup.setupBasicData();
      
      // Verify data exists
      const users = await testHelpers.getDb().user.findMany();
      expect(users.length).toBeGreaterThan(0);

      // Reset database
      await mockSetup.resetDatabase();

      // Verify data is gone
      const usersAfterReset = await testHelpers.getDb().user.findMany();
      expect(usersAfterReset.length).toBe(0);
    });
  });

  describe("Test Scenarios", () => {
    it("should setup student with active instance scenario", async () => {
      await testScenarios.studentWithActiveInstance();

      const activeInstances = await testHelpers.getActiveInstances();
      expect(activeInstances.length).toBeGreaterThan(0);

      const studentInstances = await testHelpers.getUserInstances("test-student-id");
      expect(studentInstances.length).toBeGreaterThan(0);
    });

    it("should setup student with pending request scenario", async () => {
      await testScenarios.studentWithPendingRequest();

      const pendingRequests = await testHelpers.getPendingInstanceRequests();
      expect(pendingRequests.length).toBeGreaterThan(0);

      const studentRequests = await testHelpers.getUserInstanceRequests("test-student-id");
      expect(studentRequests.length).toBeGreaterThan(0);
    });

    it("should setup staff with multiple courses scenario", async () => {
      await testScenarios.staffWithMultipleCourses();

      const courses = await testHelpers.getDb().instance_course.findMany({
        where: { main_staff: 1 },
      });
      expect(courses.length).toBeGreaterThan(2); // Should have more than the basic 2 courses
    });
  });

  describe("Test Helpers", () => {
    beforeEach(async () => {
      await mockSetup.setupCompleteTestEnvironment();
    });

    it("should create custom test user", async () => {
      const customUser = await testHelpers.createTestUser({
        email: "custom@example.com",
        name: "Custom User",
      });

      expect(customUser.email).toBe("custom@example.com");
      expect(customUser.name).toBe("Custom User");
      expect(customUser.id).toMatch(/^test-user-/);

      // Verify user exists in database
      await testHelpers.assertUserExists(customUser.id);
    });

    it("should create custom test instance", async () => {
      const customInstance = await testHelpers.createTestInstance({
        title: "Custom Instance",
        hostname: "custom-host",
        cpus: 4,
        memory: 4096,
      });

      expect(customInstance.title).toBe("Custom Instance");
      expect(customInstance.hostname).toBe("custom-host");
      expect(customInstance.cpus).toBe(4);
      expect(customInstance.memory).toBe(4096);

      // Verify instance exists in database
      await testHelpers.assertInstanceExists(customInstance.id);
    });

    it("should create custom test instance request", async () => {
      const customRequest = await testHelpers.createTestInstanceRequest({
        title: "Custom Request",
        hostname: "custom-request",
        type: "project",
        cpus: 1,
        memory: 512,
      });

      expect(customRequest.title).toBe("Custom Request");
      expect(customRequest.hostname).toBe("custom-request");
      expect(customRequest.type).toBe("project");
      expect(customRequest.cpus).toBe(1);
      expect(customRequest.memory).toBe(512);

      // Verify request exists in database
      await testHelpers.assertInstanceRequestExists(customRequest.id);
    });

    it("should get user instances with relations", async () => {
      const userInstances = await testHelpers.getUserInstances("test-student-id");
      
      expect(userInstances.length).toBeGreaterThan(0);
      
      // Check that relations are included
      const instance = userInstances[0];
      expect(instance.user).toBeDefined();
      expect(instance.course).toBeDefined();
      expect(instance.template).toBeDefined();
    });

    it("should get instance with full relations", async () => {
      const instance = await testHelpers.getInstanceWithRelations(1);
      
      expect(instance).toBeDefined();
      expect(instance.user).toBeDefined();
      expect(instance.course).toBeDefined();
      expect(instance.template).toBeDefined();
      expect(instance.samester).toBeDefined();
      expect(instance.ip_address).toBeDefined();
    });

    it("should count instances by status", async () => {
      const runningCount = await testHelpers.countInstancesByStatus("running");
      const pendingCount = await testHelpers.countInstancesByStatus("pending");
      
      expect(runningCount).toBeGreaterThanOrEqual(0);
      expect(pendingCount).toBeGreaterThanOrEqual(0);
    });

    it("should get available IP addresses", async () => {
      const availableIps = await testHelpers.getAvailableIpAddresses();
      
      expect(availableIps.length).toBeGreaterThan(0);
      
      // All returned IPs should be available
      availableIps.forEach(ip => {
        expect(ip.is_used).toBe(false);
        expect(ip.network).toBeDefined();
      });
    });

    it("should get online PVE nodes", async () => {
      const onlineNodes = await testHelpers.getOnlinePveNodes();
      
      expect(onlineNodes.length).toBeGreaterThan(0);
      
      // All returned nodes should be online
      onlineNodes.forEach(node => {
        expect(node.status).toBe("online");
      });
    });

    it("should get current active samester", async () => {
      const currentSamester = await testHelpers.getCurrentSamester();
      
      expect(currentSamester).toBeDefined();
      expect(currentSamester.active).toBe(true);
    });
  });

  describe("Test Assertions", () => {
    it("should assert object properties match", () => {
      const actual = { id: 1, name: "Test", status: "active" };
      const expected = { id: 1, name: "Test", status: "active" };
      
      expect(() => {
        PrismaTestAssertions.assertObjectPropertiesMatch(actual, expected, ["id", "name", "status"]);
      }).not.toThrow();
    });

    it("should throw error for mismatched properties", () => {
      const actual = { id: 1, name: "Test", status: "active" };
      const expected = { id: 1, name: "Different", status: "active" };
      
      expect(() => {
        PrismaTestAssertions.assertObjectPropertiesMatch(actual, expected, ["id", "name", "status"]);
      }).toThrow("Property name mismatch");
    });

    it("should assert date is recent", () => {
      const recentDate = new Date();
      
      expect(() => {
        PrismaTestAssertions.assertDateIsRecent(recentDate);
      }).not.toThrow();
    });

    it("should throw error for old date", () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      
      expect(() => {
        PrismaTestAssertions.assertDateIsRecent(oldDate, 5); // Max 5 minutes
      }).toThrow("is more than 5 minutes old");
    });

    it("should assert array contains object", () => {
      const array = [
        { id: 1, name: "Test1" },
        { id: 2, name: "Test2" },
        { id: 3, name: "Test3" },
      ];
      const expectedObject = { id: 2, name: "Test2" };
      
      expect(() => {
        PrismaTestAssertions.assertArrayContainsObject(array, expectedObject, ["id", "name"]);
      }).not.toThrow();
    });

    it("should throw error when array does not contain object", () => {
      const array = [
        { id: 1, name: "Test1" },
        { id: 2, name: "Test2" },
      ];
      const expectedObject = { id: 3, name: "Test3" };
      
      expect(() => {
        PrismaTestAssertions.assertArrayContainsObject(array, expectedObject, ["id", "name"]);
      }).toThrow("Array does not contain object");
    });

    it("should assert number is in range", () => {
      expect(() => {
        PrismaTestAssertions.assertNumberInRange(5, 1, 10);
      }).not.toThrow();
    });

    it("should throw error for number outside range", () => {
      expect(() => {
        PrismaTestAssertions.assertNumberInRange(15, 1, 10);
      }).toThrow("Value 15 is not within range [1, 10]");
    });
  });

  describe("Cleanup", () => {
    it("should cleanup test data selectively", async () => {
      // Setup some test data
      await mockSetup.setupCompleteTestEnvironment();
      
      // Create additional test data
      await testHelpers.createTestUser({ email: "cleanup-test@example.com" });
      
      // Verify data exists
      const usersBeforeCleanup = await testHelpers.getDb().user.findMany();
      expect(usersBeforeCleanup.length).toBeGreaterThan(0);
      
      // Cleanup test data
      await testHelpers.cleanupTestData();
      
      // Verify test data is gone but other data might remain
      const usersAfterCleanup = await testHelpers.getDb().user.findMany({
        where: { id: { startsWith: "test-" } },
      });
      expect(usersAfterCleanup.length).toBe(0);
    });
  });
});
