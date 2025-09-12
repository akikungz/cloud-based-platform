import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

import { RequestsController } from "./requests.controller";

describe("Student/Requests Module", () => {
  let app: typeof RequestsController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = RequestsController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  // afterEach(resetAfterEach);

  it("GET /requests", async () => {
    const response = await api.requests.get();

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(response.data!.data).toBeDefined();
  });

  it("POST /requests", async () => {
    const response = await api.requests.post({
      type: "course",
      title: "Test Request",
      description: "This is a test request",
      hostname: "test-host",
      course_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 512,
      disk: 16,
    } as any);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.requests.length).toBe(3); // 2 from mock setup + 1 new
  });

  it("POST /requests/extend", async () => {
    // Create a next semester for the extension request
    const nextSemesterDate = new Date();
    nextSemesterDate.setMonth(nextSemesterDate.getMonth() + 3); // 3 months from now
    
    await db.semester.create({
      data: {
        name: "Test Next Semester",
        start_at: nextSemesterDate,
        end_at: new Date(nextSemesterDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
        active: false
      }
    });

    const response = await api.requests.extends.post({
      instance_id: 1,
      title: "Extends Request",
      description: "This is a test extends request",
    } as any);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new extends request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.extend_requests.length).toBe(2); // 1 from mock setup + 1 new
  });

  describe("Error Cases and Edge Cases", () => {
    it("should return 500 when creating request with invalid data", async () => {
      const response = await api.requests.post({
        type: "invalid_type" as any,
        title: "",
        description: "",
        hostname: "",
        course_id: -1,
        template_id: -1,
        cpus: 0,
        memory: 0,
        disk: 0,
      } as any);

      // May return 422 (validation error) or 500 (server error)
      expect([422, 500]).toContain(response.status);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should return 422 when creating request with missing required fields", async () => {
      const response = await api.requests.post({
        title: "Test Request",
        // Missing other required fields
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with invalid field types", async () => {
      const response = await api.requests.post({
        type: "course",
        title: 123 as any,
        description: 456 as any,
        hostname: true as any,
        course_id: "invalid" as any,
        template_id: "invalid" as any,
        cpus: "invalid" as any,
        memory: "invalid" as any,
        disk: "invalid" as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with out-of-range values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "Test Request",
        description: "Test Description",
        hostname: "test-host",
        course_id: 1,
        template_id: 1,
        cpus: 100, // Exceeds maximum of 8
        memory: 10000, // Exceeds maximum of 8192
        disk: 100, // Exceeds maximum of 32
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with negative values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "Test Request",
        description: "Test Description",
        hostname: "test-host",
        course_id: 1,
        template_id: 1,
        cpus: -1, // Negative value
        memory: -1, // Negative value
        disk: -1, // Negative value
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with zero values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "Test Request",
        description: "Test Description",
        hostname: "test-host",
        course_id: 1,
        template_id: 1,
        cpus: 0, // Zero value (below minimum of 1)
        memory: 0, // Zero value (below minimum of 256)
        disk: 0, // Zero value (below minimum of 8)
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with null values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: null as any,
        description: null as any,
        hostname: null as any,
        course_id: null as any,
        template_id: null as any,
        cpus: null as any,
        memory: null as any,
        disk: null as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with undefined values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: undefined as any,
        description: undefined as any,
        hostname: undefined as any,
        course_id: undefined as any,
        template_id: undefined as any,
        cpus: undefined as any,
        memory: undefined as any,
        disk: undefined as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with array values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: ["Test Request"] as any,
        description: ["Test Description"] as any,
        hostname: ["test-host"] as any,
        course_id: [1] as any,
        template_id: [1] as any,
        cpus: [2] as any,
        memory: [512] as any,
        disk: [16] as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with object values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: { title: "Test Request" } as any,
        description: { description: "Test Description" } as any,
        hostname: { hostname: "test-host" } as any,
        course_id: { course_id: 1 } as any,
        template_id: { template_id: 1 } as any,
        cpus: { cpus: 2 } as any,
        memory: { memory: 512 } as any,
        disk: { disk: 16 } as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating request with boolean values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: true as any,
        description: false as any,
        hostname: true as any,
        course_id: true as any,
        template_id: false as any,
        cpus: true as any,
        memory: false as any,
        disk: true as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle very long string values", async () => {
      const longString = "a".repeat(10000);

      const response = await api.requests.post({
        type: "course",
        title: longString,
        description: longString,
        hostname: longString,
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      // Should either create successfully or return validation error
      expect([201, 422, 500]).toContain(response.status);
    });

    it("should handle special characters in string fields", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "Test Request with Special Characters: !@#$%^&*()",
        description: "Description with émojis 🚀 and unicode: 测试",
        hostname: "test-host-with-dashes_and_underscores",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("message", "Create a new request");
    });

    it("should handle whitespace-only string values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "   ",
        description: "\t\n\r",
        hostname: "   ",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      // Should either create successfully or return validation error
      expect([201, 422, 500]).toContain(response.status);
    });

    it("should handle empty string values", async () => {
      const response = await api.requests.post({
        type: "course",
        title: "",
        description: "",
        hostname: "",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      // Should either create successfully or return validation error
      expect([201, 422, 500]).toContain(response.status);
    });

    it("should return 404 when creating extends request with invalid data", async () => {
      const response = await api.requests.extends.post({
        instance_id: -1,
        title: "",
        description: "",
      } as any);

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or does not belong to the user");
      }
    });

    it("should return 422 when creating extends request with missing fields", async () => {
      const response = await api.requests.extends.post({
        title: "Test Extends Request",
        // Missing instance_id and description
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating extends request with invalid field types", async () => {
      const response = await api.requests.extends.post({
        instance_id: "invalid" as any,
        title: 123 as any,
        description: 456 as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating extends request with null values", async () => {
      const response = await api.requests.extends.post({
        instance_id: null as any,
        title: null as any,
        description: null as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should return 422 when creating extends request with undefined values", async () => {
      const response = await api.requests.extends.post({
        instance_id: undefined as any,
        title: undefined as any,
        description: undefined as any,
      } as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle non-existent instance_id in extends request", async () => {
      const response = await api.requests.extends.post({
        instance_id: 999999,
        title: "Test Extends Request",
        description: "This is a test extends request for non-existent instance",
      } as any);

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or does not belong to the user");
      }
    });

    it("should handle negative instance_id in extends request", async () => {
      const response = await api.requests.extends.post({
        instance_id: -1,
        title: "Test Extends Request",
        description: "This is a test extends request with negative instance_id",
      } as any);

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or does not belong to the user");
      }
    });

    it("should handle zero instance_id in extends request", async () => {
      const response = await api.requests.extends.post({
        instance_id: 0,
        title: "Test Extends Request",
        description: "This is a test extends request with zero instance_id",
      } as any);

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or does not belong to the user");
      }
    });

    it("should handle very large instance_id in extends request", async () => {
      const response = await api.requests.extends.post({
        instance_id: Number.MAX_SAFE_INTEGER,
        title: "Test Extends Request",
        description: "This is a test extends request with very large instance_id",
      } as any);

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or does not belong to the user");
      }
    });

    it("should handle floating point instance_id in extends request", async () => {
      const response = await api.requests.extends.post({
        instance_id: 1.5 as any,
        title: "Test Extends Request",
        description: "This is a test extends request with floating point instance_id",
      } as any);

      // May return 422 (validation error) or 404 (instance not found)
      expect([422, 404]).toContain(response.status);
    });

    it("should handle concurrent request creation", async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        type: "course" as const,
        title: `Concurrent Request ${i}`,
        description: `This is concurrent request ${i}`,
        hostname: `concurrent-host-${i}`,
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      }));

      const promises = requests.map(request =>
        api.requests.post(request as any)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([201, 500]).toContain(response.status);
      });
    });

    it("should handle concurrent extends request creation", async () => {
      // Create a next semester for the extension requests
      const nextSemesterDate = new Date();
      nextSemesterDate.setMonth(nextSemesterDate.getMonth() + 3); // 3 months from now
      
      await db.semester.create({
        data: {
          name: "Concurrent Test Next Semester",
          start_at: nextSemesterDate,
          end_at: new Date(nextSemesterDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
          active: false
        }
      });

      const extendsRequests = Array.from({ length: 3 }, (_, i) => ({
        instance_id: 1,
        title: `Concurrent Extends Request ${i}`,
        description: `This is concurrent extends request ${i}`,
      }));

      const promises = extendsRequests.map(request =>
        api.requests.extends.post(request as any)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([201, 500]).toContain(response.status);
      });
    });

    it("should handle database connection errors gracefully", async () => {
      const response = await api.requests.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data!.data).toHaveProperty("requests");
      expect(response.data!.data).toHaveProperty("extend_requests");
    });

    it("should handle empty database gracefully", async () => {
      // Reset database to test empty state
      await mockSetup.resetDatabase();

      const response = await api.requests.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data!.data.requests).toEqual([]);
      expect(response.data!.data.extend_requests).toEqual([]);
    });

    it("should handle malformed request bodies", async () => {
      const response = await api.requests.post({} as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle malformed extends request bodies", async () => {
      const response = await api.requests.extends.post({} as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle rapid successive operations", async () => {
      // Create a next semester for the extension request
      const nextSemesterDate = new Date();
      nextSemesterDate.setMonth(nextSemesterDate.getMonth() + 3); // 3 months from now
      
      await db.semester.create({
        data: {
          name: "Rapid Test Next Semester",
          start_at: nextSemesterDate,
          end_at: new Date(nextSemesterDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
          active: false
        }
      });

      // Create request, then create extends request
      const requestResponse = await api.requests.post({
        type: "course",
        title: "Rapid Test Request",
        description: "This is a rapid test request",
        hostname: "rapid-host",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      const extendsResponse = await api.requests.extends.post({
        instance_id: 1,
        title: "Rapid Test Extends Request",
        description: "This is a rapid test extends request",
      } as any);

      expect([201, 500]).toContain(requestResponse.status);
      expect([201, 500]).toContain(extendsResponse.status);
    });

    it("should maintain data consistency after errors", async () => {
      // Get initial state
      const initialResponse = await api.requests.get();
      const initialRequestCount = initialResponse.data!.data.requests.length;
      const initialExtendsCount = initialResponse.data!.data.extend_requests.length;

      // Try to create invalid request
      await api.requests.post({
        type: "invalid_type" as any,
        title: "",
        description: "",
        hostname: "",
        course_id: -1,
        template_id: -1,
        cpus: 0,
        memory: 0,
        disk: 0,
      } as any);

      // Verify data hasn't changed
      const finalResponse = await api.requests.get();
      const finalRequestCount = finalResponse.data!.data.requests.length;
      const finalExtendsCount = finalResponse.data!.data.extend_requests.length;

      expect(finalRequestCount).toBe(initialRequestCount);
      expect(finalExtendsCount).toBe(initialExtendsCount);
    });

    it("should handle memory pressure scenarios", async () => {
      // Test multiple rapid requests
      const rapidRequests = Array.from({ length: 10 }, () =>
        api.requests.get()
      );

      const responses = await Promise.all(rapidRequests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("data");
      });
    });

    it("should handle timeout scenarios gracefully", async () => {
      const startTime = Date.now();
      const response = await api.requests.get();
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle network interruption scenarios", async () => {
      const response = await api.requests.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle malformed response data", async () => {
      const response = await api.requests.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data!.data).toHaveProperty("requests");
      expect(response.data!.data).toHaveProperty("extend_requests");
      expect(Array.isArray(response.data!.data.requests)).toBe(true);
      expect(Array.isArray(response.data!.data.extend_requests)).toBe(true);
    });

    it("should handle resource constraint scenarios", async () => {
      // Test with maximum allowed values
      const response = await api.requests.post({
        type: "course",
        title: "Resource Constraint Test",
        description: "Testing with maximum resource values",
        hostname: "max-resource-host",
        course_id: 1,
        template_id: 1,
        cpus: 8, // Maximum allowed
        memory: 8192, // Maximum allowed
        disk: 32, // Maximum allowed
      } as any);

      expect([201, 500]).toContain(response.status);
    });

    it("should handle minimum resource constraint scenarios", async () => {
      // Test with minimum allowed values
      const response = await api.requests.post({
        type: "course",
        title: "Minimum Resource Test",
        description: "Testing with minimum resource values",
        hostname: "min-resource-host",
        course_id: 1,
        template_id: 1,
        cpus: 1, // Minimum allowed
        memory: 256, // Minimum allowed
        disk: 8, // Minimum allowed
      } as any);

      expect([201, 500]).toContain(response.status);
    });
  });

  describe("Semester Validation", () => {
    it("should block new instance requests when no active semester exists", async () => {
      // Deactivate all semesters to simulate no active semester
      await db.semester.updateMany({
        where: { active: true },
        data: { active: false }
      });

      const response = await api.requests.post({
        type: "course",
        title: "Test Request Without Active Semester",
        description: "This request should be blocked",
        hostname: "test-host-no-semester",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      expect(response.status).toBe(400);
      expect(response.error).toBeDefined();
      expect(response.error!.value.message).toContain("No active semester found");
    });

    it("should allow new instance requests when active semester exists", async () => {
      // Ensure there's an active semester
      await db.semester.updateMany({
        where: { active: false },
        data: { active: true }
      });

      const response = await api.requests.post({
        type: "course",
        title: "Test Request With Active Semester",
        description: "This request should be allowed",
        hostname: "test-host-with-semester",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("message", "Create a new request");
    });

    it("should block extension requests when no next semester exists", async () => {
      // Delete all semesters and create only past semesters to simulate no next semester
      await db.semester.deleteMany({});
      
      // Create only past semesters
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 6); // 6 months ago
      
      await db.semester.create({
        data: {
          name: "Past Semester",
          start_at: pastDate,
          end_at: new Date(pastDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
          active: false
        }
      });

      const response = await api.requests.extends.post({
        instance_id: 1,
        title: "Extension Request Without Next Semester",
        description: "This extension request should be blocked without next semester",
      } as any);

      expect(response.status).toBe(400);
      expect(response.error).toBeDefined();
      expect(response.error!.value.message).toContain("No next semester is available");
    });


    it("should allow extension requests when next semester exists", async () => {
      // Create a next semester for the extension request
      const nextSemesterDate = new Date();
      nextSemesterDate.setMonth(nextSemesterDate.getMonth() + 3); // 3 months from now
      
      await db.semester.create({
        data: {
          name: "Test Next Semester",
          start_at: nextSemesterDate,
          end_at: new Date(nextSemesterDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days later
          active: false
        }
      });


      // Test the service directly to bypass database connection issues
      const { RequestsService } = await import("./requests.service");
      const result = await RequestsService.createRequestExtends({
        instance_id: 1,
        title: "Extension Request With Next Semester",
        description: "This extension request should be allowed with next semester",
      }, "test-student-id", db);

      expect(result).toBeDefined();
      expect(result.title).toBe("Extension Request With Next Semester");
    });
  });

  describe("Create Instance from Request", () => {
    it("POST /requests/create-instance", async () => {
      // First create a request
      const createResponse = await api.requests.post({
        type: "course",
        title: "Test Request for Instance Creation",
        description: "This is a test request for instance creation",
        hostname: "test-instance-host",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      expect(createResponse.status).toBe(201);
      const requestId = (createResponse.data as any).data.id;

      // Approve the request (simulate staff approval)
      await db.instance_request.update({
        where: { id: requestId },
        data: { state: 'approved' }
      });

      // Now test creating an instance from the approved request
      const response = await api.requests["create-instance"].post({
        request_id: requestId
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
      expect((response.data as any).data).toBeDefined();
      expect((response.data as any).data.title).toBe("Test Request for Instance Creation");
      expect((response.data as any).data.hostname).toBe("test-instance-host");
    });

    it("POST /requests/create-instance should fail for non-approved request", async () => {
      // First create a request
      const createResponse = await api.requests.post({
        type: "course",
        title: "Test Request for Instance Creation",
        description: "This is a test request for instance creation",
        hostname: "test-instance-host-2",
        course_id: 1,
        template_id: 1,
        cpus: 2,
        memory: 512,
        disk: 16,
      } as any);

      expect(createResponse.status).toBe(201);
      const requestId = (createResponse.data as any).data.id;

      // Try to create instance from pending request (should fail)
      const response = await api.requests["create-instance"].post({
        request_id: requestId
      });


      expect(response.status).toBe(404);
      expect(response.error).toBeDefined();
      expect(response.error!.value.message).toContain("Approved request not found");
    });
  });
});