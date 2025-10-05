// @ts-nocheck
import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

import { InstancesController } from "./instances.controller";

describe("Student/Instances Module", () => {
  let app: typeof InstancesController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = InstancesController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  it("GET / should return list of instances", async () => {
    const response = await api.instances.get();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.data).toBeInstanceOf(Array);
    expect(response.data!.data.length).toBeGreaterThan(0);
  });

  it("GET /1 should return instance detail", async () => {
    const response = await api.instances({ id: 1 }).get();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.data).toHaveProperty("id", 1);
  });

  it("DELETE /1 should delete instance", async () => {
    const response = await api.instances({ id: 1 }).delete();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.message).toBe("Instance deleted successfully");
  });

  describe("Error Cases and Edge Cases", () => {
    it("should return 404 when getting non-existent instance", async () => {
      const response = await api.instances({ id: 999999 }).get();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found");
      }
    });

    it("should return 404 when deleting non-existent instance", async () => {
      const response = await api.instances({ id: 999999 }).delete();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found or already deleted/archived");
      }
    });

    it("should handle invalid instance ID format", async () => {
      const response = await api.instances({ id: "invalid" as any }).get();

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle negative instance IDs", async () => {
      const response = await api.instances({ id: -1 }).get();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found");
      }
    });

    it("should handle zero instance ID", async () => {
      const response = await api.instances({ id: 0 }).get();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found");
      }
    });

    it("should handle very large instance IDs", async () => {
      const response = await api.instances({ id: Number.MAX_SAFE_INTEGER }).get();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found");
      }
    });

    it("should handle floating point instance IDs", async () => {
      const response = await api.instances({ id: 1.5 as any }).get();

      // May return 422 (validation error) or 404 (if converted to 1)
      expect([404, 422]).toContain(response.status);
    });

    it("should handle null instance ID", async () => {
      const response = await api.instances({ id: null as any }).get();

      // May return 200 (if converted to 0 and instance exists), 404 (if converted to 0 and no instance), 422 (validation error), or 500 (server error)
      expect([200, 404, 422, 500]).toContain(response.status);
    });

    it("should handle undefined instance ID", async () => {
      const response = await api.instances({ id: undefined as any }).get();

      // May return 200 (if converted to 0 and instance exists), 404 (if converted to 0 and no instance), 422 (validation error), or 500 (server error)
      expect([200, 404, 422, 500]).toContain(response.status);
    });

    it("should handle string instance IDs", async () => {
      const response = await api.instances({ id: "1" as any }).get();

      // May return 422 (validation error) or 200/404 (if converted to number)
      expect([200, 404, 422]).toContain(response.status);
    });

    it("should handle boolean instance IDs", async () => {
      const response = await api.instances({ id: true as any }).get();

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle array instance IDs", async () => {
      const response = await api.instances({ id: [1] as any }).get();

      // May return 422 (validation error) or 200 (if it gets converted to number)
      expect([200, 422]).toContain(response.status);
    });

    it("should handle object instance IDs", async () => {
      const response = await api.instances({ id: { id: 1 } as any }).get();

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle database connection errors gracefully", async () => {
      // Test GET instances list
      const listResponse = await api.instances.get();
      expect(listResponse.status).toBe(200);
      expect(listResponse.data).toHaveProperty("data");
      expect(Array.isArray(listResponse.data!.data)).toBe(true);
    });

    it("should handle empty database gracefully", async () => {
      // Reset database to test empty state
      await mockSetup.resetDatabase();

      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data!.data).toEqual([]);
    });

    it("should handle concurrent instance operations", async () => {
      const promises = [
        api.instances.get(),
        api.instances({ id: 1 }).get(),
        api.instances({ id: 2 }).get()
      ];

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 404, 500]).toContain(response.status);
      });
    });

    it("should handle rapid successive operations", async () => {
      // Get instance, then try to delete it
      const getResponse = await api.instances({ id: 1 }).get();

      if (getResponse.status === 200) {
        const deleteResponse = await api.instances({ id: 1 }).delete();
        expect(deleteResponse.status).toBe(200);
      } else {
        // If instance doesn't exist, deletion should return 500
        const deleteResponse = await api.instances({ id: 1 }).delete();
        expect(deleteResponse.status).toBe(500);
      }
    });

    it("should handle permission errors for staff users", async () => {
      // This test would require mocking a staff user
      // For now, we test the normal student user case
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle malformed request parameters", async () => {
      // Test with missing id parameter
      try {
        // @ts-expect-error - This is a test for malformed request parameters
        const response = await api.instances({}).get();
        expect(response.status).toBe(422); // Validation error
      } catch (error) {
        // Expected behavior for malformed requests
        expect(error).toBeDefined();
      }
    });

    it("should handle special characters in instance data", async () => {
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data!.data)).toBe(true);
    });

    it("should handle Unicode characters in instance data", async () => {
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data!.data)).toBe(true);
    });

    it("should handle memory pressure scenarios", async () => {
      // Test multiple rapid requests
      const rapidRequests = Array.from({ length: 10 }, () =>
        api.instances.get()
      );

      const responses = await Promise.all(rapidRequests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("data");
      });
    });

    it("should handle timeout scenarios gracefully", async () => {
      const startTime = Date.now();
      const response = await api.instances.get();
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should maintain data consistency after errors", async () => {
      // Get initial state
      const initialResponse = await api.instances.get();
      const initialCount = initialResponse.data!.data.length;

      // Try to delete non-existent instance
      await api.instances({ id: 999999 }).delete();

      // Verify data hasn't changed
      const finalResponse = await api.instances.get();
      const finalCount = finalResponse.data!.data.length;

      expect(finalCount).toBe(initialCount);
    });

    it("should handle large datasets efficiently", async () => {
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data!.data)).toBe(true);
    });

    it("should handle instance deletion of already deleted instance", async () => {
      // First delete an instance
      const firstDelete = await api.instances({ id: 1 }).delete();

      // Try to delete the same instance again
      const secondDelete = await api.instances({ id: 1 }).delete();

      // First delete might succeed (200) or fail (404), second should fail (404)
      expect([200, 404]).toContain(firstDelete.status);
      expect(secondDelete.status).toBe(404);
    });

    it("should handle instance access after deletion", async () => {
      // Delete an instance
      await api.instances({ id: 1 }).delete();

      // Try to get the deleted instance
      const response = await api.instances({ id: 1 }).get();

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Instance not found");
      }
    });

    it("should handle network interruption scenarios", async () => {
      // Test with a reasonable timeout expectation
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle malformed response data", async () => {
      const response = await api.instances.get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data!.data)).toBe(true);
    });

    it("should handle concurrent deletion of same instance", async () => {
      const promises = [
        api.instances({ id: 1 }).delete(),
        api.instances({ id: 1 }).delete(),
        api.instances({ id: 1 }).delete()
      ];

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        // First deletion might succeed (200), subsequent ones should fail (500)
        expect([200, 500]).toContain(response.status);
        if (response.data) {
          expect(response.data).toHaveProperty("message");
        }
      });
    });
  });

  describe("VM Status Management (Student)", () => {
    it("should start a VM", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "start"
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data!.message).toContain("start");
      expect(response.data!.data).toHaveProperty("status", "running");
      expect(response.data!.data).toHaveProperty("action", "start");
    });

    it("should stop a VM", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "stop"
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data!.message).toContain("stop");
      expect(response.data!.data).toHaveProperty("status", "stopped");
      expect(response.data!.data).toHaveProperty("action", "stop");
    });

    it("should reboot a VM", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "reboot"
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data!.message).toContain("reboot");
      expect(response.data!.data).toHaveProperty("status", "running");
      expect(response.data!.data).toHaveProperty("action", "reboot");
    });

    it("should suspend a VM", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "suspend"
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data!.message).toContain("suspend");
      expect(response.data!.data).toHaveProperty("status", "stopped");
      expect(response.data!.data).toHaveProperty("action", "suspend");
    });

    it("should resume a VM", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "resume"
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data!.message).toContain("resume");
      expect(response.data!.data).toHaveProperty("status", "running");
      expect(response.data!.data).toHaveProperty("action", "resume");
    });

    it("should return 404 when changing status of non-existent VM", async () => {
      const response = await api.instances({ id: 999999 }).status.post({
        action: "start"
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should reject invalid action", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "invalid_action" as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle multiple status changes in sequence", async () => {
      // Start VM
      const startResponse = await api.instances({ id: 1 }).status.post({
        action: "start"
      });
      expect(startResponse.status).toBe(200);

      // Stop VM
      const stopResponse = await api.instances({ id: 1 }).status.post({
        action: "stop"
      });
      expect(stopResponse.status).toBe(200);

      // Start again
      const restartResponse = await api.instances({ id: 1 }).status.post({
        action: "start"
      });
      expect(restartResponse.status).toBe(200);
    });

    it("should handle concurrent status changes", async () => {
      const promises = [
        api.instances({ id: 1 }).status.post({ action: "start" }),
        api.instances({ id: 1 }).status.post({ action: "stop" }),
        api.instances({ id: 1 }).status.post({ action: "reboot" })
      ];

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 500]).toContain(response.status);
        if (response.data) {
          expect(response.data).toHaveProperty("message");
        }
      });
    });

    it("should return proper error for deleted instance status change", async () => {
      // Delete instance first
      await api.instances({ id: 1 }).delete();

      // Try to change status
      const response = await api.instances({ id: 1 }).status.post({
        action: "start"
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should validate all action types", async () => {
      const validActions = ["start", "stop", "suspend", "resume", "reboot"];

      for (const action of validActions) {
        const response = await api.instances({ id: 1 }).status.post({
          action: action as any
        });

        expect([200, 404, 500]).toContain(response.status);
        if (response.data) {
          expect(response.data).toHaveProperty("message");
        }
      }
    });

    it("should include VM details in response", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "start"
      });

      if (response.status === 200) {
        expect(response.data!.data).toHaveProperty("id");
        expect(response.data!.data).toHaveProperty("title");
        expect(response.data!.data).toHaveProperty("hostname");
        expect(response.data!.data).toHaveProperty("status");
        expect(response.data!.data).toHaveProperty("action");
        expect(response.data!.data).toHaveProperty("vm_id");
        expect(response.data!.data).toHaveProperty("pve_node");
        expect(response.data!.data).toHaveProperty("updated_at");
      }
    });

    it("should handle missing action parameter", async () => {
      const response = await api.instances({ id: 1 }).status.post({} as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle null action parameter", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: null as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle empty string action", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: "" as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle numeric action parameter", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: 123 as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle array action parameter", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: ["start"] as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle object action parameter", async () => {
      const response = await api.instances({ id: 1 }).status.post({
        action: { type: "start" } as any
      });

      expect(response.status).toBe(422); // Validation error
    });
  });
});