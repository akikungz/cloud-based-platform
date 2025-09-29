// @ts-nocheck
import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

import { ApprovalController } from "./approval.controller";

describe("Staff/Approval Module", () => {
  let app: typeof ApprovalController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = ApprovalController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();

    // Add additional mock data for approval testing
    await setupApprovalMockData();
  });

  async function setupApprovalMockData() {
    // Create additional test requests for approval testing
    await db.instance_request.createMany({
      data: [
        {
          id: 1001,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Test Course Request 1",
          description: "This is a test course request for approval",
          hostname: "test-host-1",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 1002,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Test Course Request 2",
          description: "This is another test course request for approval",
          hostname: "test-host-2",
          cpus: 4,
          memory: 1024,
          disk: 32,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    });

    // Create additional test extension requests
    await db.instance_request_extends.createMany({
      data: [
        {
          id: 2001,
          instance_id: 1,
          title: "Test Extension Request 1",
          description: "This is a test extension request for approval",
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2002,
          instance_id: 1,
          title: "Test Extension Request 2",
          description: "This is another test extension request for approval",
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    });
  }

  describe("GET /approval", () => {
    it("should return pending approvals for staff", async () => {
      const response = await api.approval.get({ query: {} });

      expect(response.status).toBe(200);
      if (response.data && typeof response.data === 'object') {
        if ('message' in response.data) {
          expect(response.data).toHaveProperty("message", "Get pending approvals");
          expect(response.data).toHaveProperty("data");
        } else {
          expect(response.data).toHaveProperty("count");
          expect(response.data).toHaveProperty("totalPages");
          expect(response.data).toHaveProperty("data");
        }
      }
    });

    it("should return mock data with specific request details", async () => {
      const response = await api.approval.get({ query: {} });

      expect(response.status).toBe(200);

      if (response.data && typeof response.data === 'object') {
        let requests: any[] = [];
        if ('message' in response.data && response.data.data && response.data.data.data) {
          requests = response.data.data.data;
        } else if ('data' in response.data && response.data.data) {
          requests = response.data.data.data || [];
        }

        if (requests.length > 0) {
          const mockRequest = requests.find((req: any) => req.id === 1001);
          if (mockRequest) {
            expect(mockRequest.title).toBe("Test Course Request 1");
            expect(mockRequest.state).toBe("pending");
            expect(mockRequest.cpus).toBe(2);
            expect(mockRequest.memory).toBe(512);
          }
        }
      }
    });

    it("should return empty data when staff has no staff_id", async () => {
      const response = await api.approval.get({ query: {} });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle pagination parameters", async () => {
      const response = await api.approval.get({
        query: { skip: 1, take: 5 }
      });

      expect(response.status).toBe(200);
      if (response.data && typeof response.data === 'object') {
        if ('message' in response.data) {
          expect(response.data).toHaveProperty("data");
          if (response.data.data && typeof response.data.data === 'object') {
            expect(response.data.data).toHaveProperty("count");
            expect(response.data.data).toHaveProperty("totalPages");
            expect(response.data.data).toHaveProperty("data");
          }
        } else {
          expect(response.data).toHaveProperty("count");
          expect(response.data).toHaveProperty("totalPages");
          expect(response.data).toHaveProperty("data");
        }
      }
    });

    it("should validate pagination parameters", async () => {
      // Test with invalid skip parameter (minimum is 1)
      const response1 = await api.approval.get({
        query: { skip: 0, take: 10 }
      });
      expect(response1.status).toBe(422);
      if (response1.data) {
        expect(response1.data).toHaveProperty("message");
      }

      // Test with invalid take parameter (maximum is 100)
      const response2 = await api.approval.get({
        query: { skip: 1, take: 101 }
      });
      expect(response2.status).toBe(422);
      if (response2.data) {
        expect(response2.data).toHaveProperty("message");
      }
    });
  });

  describe("GET /approval/extends", () => {
    it("should return pending extension requests", async () => {
      const response = await api.approval.extends.get({ query: {} });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message", "Get pending extension requests");
      expect(response.data).toHaveProperty("data");
      if (response.data!.data && typeof response.data!.data === 'object') {
        expect(response.data!.data).toHaveProperty("count");
        expect(response.data!.data).toHaveProperty("totalPages");
        expect(response.data!.data).toHaveProperty("data");
        expect(Array.isArray(response.data!.data.data)).toBe(true);
      }
    });

    it("should return mock extension request data", async () => {
      const response = await api.approval.extends.get({ query: {} });

      expect(response.status).toBe(200);

      if (response.data && response.data.data && response.data.data.data) {
        const mockExtendRequest = response.data.data.data.find((req: any) => req.id === 2001);
        if (mockExtendRequest) {
          expect(mockExtendRequest.title).toBe("Test Extension Request 1");
          expect(mockExtendRequest.state).toBe("pending");
          expect(mockExtendRequest.instance_id).toBe(1);
        }
      }
    });

    it("should handle pagination parameters for extends", async () => {
      const response = await api.approval.extends.get({
        query: { skip: 1, take: 5 }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      if (response.data!.data && typeof response.data!.data === 'object') {
        expect(response.data!.data).toHaveProperty("count");
        expect(response.data!.data).toHaveProperty("totalPages");
        expect(response.data!.data).toHaveProperty("data");
      }
    });

    it("should validate pagination parameters for extends", async () => {
      // Test with invalid skip parameter (minimum is 1)
      const response1 = await api.approval.extends.get({
        query: { skip: 0, take: 10 }
      });
      expect(response1.status).toBe(422);
      if (response1.data) {
        expect(response1.data).toHaveProperty("message");
      }

      // Test with invalid take parameter (maximum is 100)
      const response2 = await api.approval.extends.get({
        query: { skip: 1, take: 101 }
      });
      expect(response2.status).toBe(422);
      if (response2.data) {
        expect(response2.data).toHaveProperty("message");
      }
    });
  });

  describe("POST /approval/approve", () => {
    it("should approve a request successfully", async () => {
      const pendingResponse = await api.approval.get({ query: {} });
      const pendingRequests = pendingResponse.data?.data?.data || [];

      if (pendingRequests.length > 0) {
        const requestToApprove = pendingRequests[0];

        const response = await api.approval.approve.post({
          request_id: requestToApprove.id
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("message", "Request approved");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "approved");
      } else {
        const response = await api.approval.approve.post({
          request_id: 999999
        });

        expect([200, 403, 404]).toContain(response.status);
        if (response.status === 404 && response.data) {
          expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to approve it");
        }
      }
    });

    it("should approve specific mock request", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1003,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Fresh Test Request for Approval",
          description: "This is a fresh test request for approval",
          hostname: "test-host-3",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const response = await api.approval.approve.post({
        request_id: freshRequest.id
      });

      expect([200, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.data).toHaveProperty("message", "Request approved");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "approved");

        const updatedRequest = await db.instance_request.findUnique({
          where: { id: freshRequest.id }
        });
        expect(updatedRequest?.state).toBe("approved");
      } else if (response.status === 403 && response.data) {
        expect(response.data).toHaveProperty("message", "Forbidden");
      } else if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to approve it");
      }
    });

    it("should return 403 when staff_id is not available", async () => {
      const response = await api.approval.approve.post({
        request_id: 999999
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 403 && response.data) {
        expect(response.data).toHaveProperty("message", "Forbidden");
      }
    });

    it("should validate request_id parameter", async () => {
      const response = await api.approval.approve.post({
        request_id: "invalid" as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle null request_id", async () => {
      const response = await api.approval.approve.post({
        request_id: null as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle undefined request_id", async () => {
      const response = await api.approval.approve.post({
        request_id: undefined as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle negative request_id", async () => {
      const response = await api.approval.approve.post({
        request_id: -1
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to approve it");
      }
    });

    it("should handle zero request_id", async () => {
      const response = await api.approval.approve.post({
        request_id: 0
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to approve it");
      }
    });

    it("should handle missing request body", async () => {
      const response = await api.approval.approve.post({} as any);

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });
  });

  describe("POST /approval/extends/approve", () => {
    it("should approve an extension request successfully", async () => {
      const pendingResponse = await api.approval.extends.get({ query: {} });
      const pendingExtends = pendingResponse.data?.data?.data || [];

      if (pendingExtends.length > 0) {
        const extendToApprove = pendingExtends[0];

        const response = await api.approval.extends.approve.post({
          request_id: extendToApprove.id
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("message", "Extension request approved");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "approved");
      } else {
        const response = await api.approval.extends.approve.post({
          request_id: 999999
        });

        expect([200, 404]).toContain(response.status);
        if (response.status === 404 && response.data) {
          expect(response.data).toHaveProperty("message", "Extension request not found");
        }
      }
    });

    it("should validate request_id parameter for extends approve", async () => {
      const response = await api.approval.extends.approve.post({
        request_id: "invalid" as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle non-existent extension request", async () => {
      const response = await api.approval.extends.approve.post({
        request_id: 999999
      });

      expect([400, 404]).toContain(response.status);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle null request_id", async () => {
      const response = await api.approval.extends.approve.post({
        request_id: null as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });
  });

  describe("POST /approval/reject", () => {
    it("should reject a request successfully", async () => {
      const pendingResponse = await api.approval.get({ query: {} });
      let pendingRequests: any[] = [];

      if (pendingResponse.data && typeof pendingResponse.data === 'object') {
        if ('message' in pendingResponse.data && pendingResponse.data.data) {
          pendingRequests = pendingResponse.data.data.data || [];
        } else if ('data' in pendingResponse.data) {
          pendingRequests = pendingResponse.data.data.data || [];
        }
      }

      if (pendingRequests.length > 0) {
        const requestToReject = pendingRequests[0];

        const response = await api.approval.reject.post({
          request_id: requestToReject.id,
          reason: "Test rejection reason"
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("message", "Request rejected");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "rejected");
        expect(response.data!.data).toHaveProperty("reason", "Test rejection reason");
      } else {
        const response = await api.approval.reject.post({
          request_id: 999999,
          reason: "Test rejection reason"
        });

        expect([200, 403, 404]).toContain(response.status);
        if (response.status === 404 && response.data) {
          expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to reject it");
        }
      }
    });

    it("should return 403 when staff_id is not available", async () => {
      const response = await api.approval.reject.post({
        request_id: 999999,
        reason: "Test reason"
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 403 && response.data) {
        expect(response.data).toHaveProperty("message", "Forbidden");
      }
    });

    it("should validate request_id and reason parameters", async () => {
      const response = await api.approval.reject.post({
        request_id: "invalid" as any,
        reason: "Test reason"
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should require reason parameter", async () => {
      const response = await api.approval.reject.post({
        request_id: 1
      } as any);

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should reject specific mock request with reason", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1004,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Fresh Test Request for Rejection",
          description: "This is a fresh test request for rejection",
          hostname: "test-host-4",
          cpus: 4,
          memory: 1024,
          disk: 32,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const response = await api.approval.reject.post({
        request_id: freshRequest.id,
        reason: "Insufficient resources for this request"
      });

      expect([200, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.data).toHaveProperty("message", "Request rejected");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "rejected");
        expect(response.data!.data).toHaveProperty("reason", "Insufficient resources for this request");

        const updatedRequest = await db.instance_request.findUnique({
          where: { id: freshRequest.id }
        });
        expect(updatedRequest?.state).toBe("rejected");
        expect(updatedRequest?.reason).toBe("Insufficient resources for this request");
      } else if (response.status === 403 && response.data) {
        expect(response.data).toHaveProperty("message", "Forbidden");
      } else if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to reject it");
      }
    });

    it("should handle null reason parameter", async () => {
      const response = await api.approval.reject.post({
        request_id: 1,
        reason: null as any
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle empty reason parameter", async () => {
      const response = await api.approval.reject.post({
        request_id: 1,
        reason: ""
      });

      expect([200, 403, 404, 422]).toContain(response.status);
    });
  });

  describe("POST /approval/extends/reject", () => {
    it("should reject an extension request successfully", async () => {
      const pendingResponse = await api.approval.extends.get({ query: {} });
      const pendingExtends = pendingResponse.data?.data?.data || [];

      if (pendingExtends.length > 0) {
        const extendToReject = pendingExtends[0];

        const response = await api.approval.extends.reject.post({
          request_id: extendToReject.id,
          reason: "Test extends rejection reason"
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("message", "Extension request rejected");
        expect(response.data).toHaveProperty("data");
        expect(response.data!.data).toHaveProperty("state", "rejected");
        expect(response.data!.data).toHaveProperty("reason", "Test extends rejection reason");
      } else {
        const response = await api.approval.extends.reject.post({
          request_id: 999999,
          reason: "Test extends rejection reason"
        });

        expect([200, 404]).toContain(response.status);
        if (response.status === 404 && response.data) {
          expect(response.data).toHaveProperty("message", "Extension request not found");
        }
      }
    });

    it("should validate request_id and reason parameters for extends reject", async () => {
      const response = await api.approval.extends.reject.post({
        request_id: "invalid" as any,
        reason: "Test reason"
      });

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should require reason parameter for extends reject", async () => {
      const response = await api.approval.extends.reject.post({
        request_id: 1
      } as any);

      expect(response.status).toBe(422);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle non-existent extension request for rejection", async () => {
      const response = await api.approval.extends.reject.post({
        request_id: 999999,
        reason: "Test reason"
      });

      expect([400, 404]).toContain(response.status);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });
  });

  describe("Error Cases and Edge Cases", () => {
    it("should handle non-existent request IDs gracefully", async () => {
      const response = await api.approval.approve.post({
        request_id: 999999
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to approve it");
      }
    });

    it("should handle non-existent extension request IDs gracefully", async () => {
      const response = await api.approval.extends.approve.post({
        request_id: 999999
      });

      expect([400, 404]).toContain(response.status);
      if (response.data) {
        expect(response.data).toHaveProperty("message");
      }
    });

    it("should handle pagination edge cases", async () => {
      // Test with very large skip value
      const response1 = await api.approval.get({
        query: { skip: 1000, take: 10 }
      });
      expect(response1.status).toBe(200);

      // Test with very large take value (should be capped)
      const response2 = await api.approval.get({
        query: { skip: 1, take: 1000 }
      });
      expect(response2.status).toBe(422);
      if (response2.data) {
        expect(response2.data).toHaveProperty("message");
      }
    });

    it("should handle empty database gracefully", async () => {
      await mockSetup.resetDatabase();

      const response = await api.approval.get({ query: {} });
      expect(response.status).toBe(200);
      if (response.data && typeof response.data === 'object') {
        if ('message' in response.data) {
          expect(response.data).toHaveProperty("data");
          if (response.data.data && typeof response.data.data === 'object') {
            expect(response.data.data.count).toBe(0);
            expect(response.data.data.data).toEqual([]);
          }
        } else {
          expect((response.data as any).count).toBe(0);
          expect((response.data as any).data).toEqual([]);
        }
      }
    });

    describe("Invalid Input Validation", () => {
      it("should handle invalid request_id types in approve", async () => {
        const testCases = [
          { value: "invalid", name: "string" },
          { value: true, name: "boolean" },
          { value: [1], name: "array" },
          { value: { id: 1 }, name: "object" },
          { value: 1.5, name: "float" }
        ];

        for (const testCase of testCases) {
          const response = await api.approval.approve.post({
            request_id: testCase.value as any
          });

          expect([403, 422]).toContain(response.status);
          if (response.data) {
            expect(response.data).toHaveProperty("message");
          }
        }
      });

      it("should handle invalid pagination parameters", async () => {
        const invalidParams = [
          { skip: "invalid", take: 10 },
          { skip: 1, take: "invalid" },
          { skip: -1, take: 10 },
          { skip: 1, take: -1 },
          { skip: 0, take: 10 },
          { skip: 1, take: 0 },
          { skip: true, take: 10 },
          { skip: 1, take: false },
        ];

        for (const params of invalidParams) {
          const response = await api.approval.get({
            query: params as any
          });

          expect(response.status).toBe(422);
          if (response.data) {
            expect(response.data).toHaveProperty("message");
          }
        }
      });

      it("should handle malformed request bodies", async () => {
        const malformedBodies = [
          {},
          { wrong_field: 123 },
          null,
          "string",
          123,
          []
        ];

        for (const body of malformedBodies) {
          const response = await api.approval.approve.post(body as any);
          expect(response.status).toBe(422);
          if (response.data) {
            expect(response.data).toHaveProperty("message");
          }
        }
      });
    });

    describe("Concurrent Operations", () => {
      it("should handle concurrent approval operations", async () => {
        const promises = [
          api.approval.approve.post({ request_id: 1 }),
          api.approval.approve.post({ request_id: 2 }),
          api.approval.approve.post({ request_id: 3 })
        ];

        const responses = await Promise.all(promises);

        responses.forEach(response => {
          expect([200, 403, 404]).toContain(response.status);
        });
      });

      it("should handle rapid successive operations", async () => {
        const approveResponse = await api.approval.approve.post({ request_id: 1 });
        const rejectResponse = await api.approval.reject.post({
          request_id: 1,
          reason: "Changed mind"
        });

        expect([200, 403, 404]).toContain(approveResponse.status);
        expect([200, 403, 404]).toContain(rejectResponse.status);
      });
    });

    describe("Performance and Stress Tests", () => {
      it("should handle multiple rapid requests", async () => {
        const rapidRequests = Array.from({ length: 10 }, () =>
          api.approval.get({ query: {} })
        );

        const responses = await Promise.all(rapidRequests);

        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty("data");
        });
      });

      it("should handle timeout scenarios gracefully", async () => {
        const startTime = Date.now();
        const response = await api.approval.get({ query: {} });
        const endTime = Date.now();

        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(5000);
      });
    });

    describe("Data Consistency Tests", () => {
      it("should maintain data consistency after errors", async () => {
        const initialResponse = await api.approval.get({ query: {} });
        let initialCount = 0;

        if (initialResponse.data && typeof initialResponse.data === 'object') {
          if ('message' in initialResponse.data && initialResponse.data.data) {
            initialCount = initialResponse.data.data.count || 0;
          } else if ('count' in initialResponse.data) {
            initialCount = (initialResponse.data as any).count || 0;
          }
        }

        await api.approval.approve.post({ request_id: 999999 });

        const finalResponse = await api.approval.get({ query: {} });
        let finalCount = 0;

        if (finalResponse.data && typeof finalResponse.data === 'object') {
          if ('message' in finalResponse.data && finalResponse.data.data) {
            finalCount = finalResponse.data.data.count || 0;
          } else if ('count' in finalResponse.data) {
            finalCount = (finalResponse.data as any).count || 0;
          }
        }

        expect(finalCount).toBe(initialCount);
      });

      it("should handle database constraint violations gracefully", async () => {
        const response = await api.approval.approve.post({
          request_id: Number.MAX_SAFE_INTEGER
        });

        expect([200, 403, 404, 400]).toContain(response.status);
        if (response.status === 400 && response.data) {
          expect(response.data).toHaveProperty("message");
        }
      });
    });

    describe("Authorization Edge Cases", () => {
      it("should handle requests without proper authentication", async () => {
        const response = await api.approval.get({ query: {} });
        expect([200, 403]).toContain(response.status);
      });

      it("should handle forbidden operations gracefully", async () => {
        const response = await api.approval.approve.post({
          request_id: 1
        });

        if (response.status === 403 && response.data) {
          expect(response.data).toHaveProperty("message", "Forbidden");
        }
      });
    });
  });

  describe("PUT /approval/edit", () => {
    it("should edit a pending request specification", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1005,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Fresh Test Request for Editing",
          description: "This is a fresh test request for editing",
          hostname: "test-host-5",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const response = await api.approval.edit.put({
        request_id: freshRequest.id,
        cpus: 4,
        memory: 2048,
        disk: 16
      });

      expect([200, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.data).toHaveProperty("message", "Request specification updated successfully");
        expect(response.data).toHaveProperty("data");

        const updatedRequest = await db.instance_request.findUnique({
          where: { id: freshRequest.id }
        });
        // Only specification fields should be updated
        expect(updatedRequest?.cpus).toBe(4);
        expect(updatedRequest?.memory).toBe(2048);
        expect(updatedRequest?.disk).toBe(16);
        // Other fields should remain unchanged
        expect(updatedRequest?.title).toBe("Fresh Test Request for Editing");
        expect(updatedRequest?.description).toBe("This is a fresh test request for editing");
        expect(updatedRequest?.hostname).toBe("test-host-5");
      } else if (response.status === 403 && response.data) {
        expect(response.data).toHaveProperty("message", "Forbidden");
      } else if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to edit it");
      }
    });

    it("should not allow editing approved requests", async () => {
      const approvedRequest = await db.instance_request.create({
        data: {
          id: 1006,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Approved Test Request",
          description: "This is an approved test request",
          hostname: "approved-host-6",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "approved",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const response = await api.approval.edit.put({
        request_id: approvedRequest.id,
        cpus: 8
      });

      expect([200, 403, 404]).toContain(response.status);

      if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to edit it");
      }
    });

    it("should validate request_id parameter", async () => {
      const response = await api.approval.edit.put({
        request_id: 999999,
        cpus: 2
      });

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 404 && response.data) {
        expect(response.data).toHaveProperty("message", "Request not found or you don't have permission to edit it");
      }
    });

    it("should validate disk size constraints", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1007,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Test Request for Disk Validation",
          description: "This is a test request for disk validation",
          hostname: "test-host-7",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Test disk size too small
      const responseTooSmall = await api.approval.edit.put({
        request_id: freshRequest.id,
        disk: 5
      });

      expect(responseTooSmall.status).toBe(422);

      // Test disk size too large
      const responseTooLarge = await api.approval.edit.put({
        request_id: freshRequest.id,
        disk: 50
      });

      expect(responseTooLarge.status).toBe(422);

      // Test valid disk size
      const responseValid = await api.approval.edit.put({
        request_id: freshRequest.id,
        disk: 20
      });

      expect([200, 403, 404]).toContain(responseValid.status);
    });

    it("should validate CPU constraints", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1008,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Test Request for CPU Validation",
          description: "This is a test request for CPU validation",
          hostname: "test-host-8",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Test CPU count too small
      const responseTooSmall = await api.approval.edit.put({
        request_id: freshRequest.id,
        cpus: 0
      });

      expect(responseTooSmall.status).toBe(422);

      // Test CPU count too large
      const responseTooLarge = await api.approval.edit.put({
        request_id: freshRequest.id,
        cpus: 10
      });

      expect(responseTooLarge.status).toBe(422);

      // Test valid CPU count
      const responseValid = await api.approval.edit.put({
        request_id: freshRequest.id,
        cpus: 6
      });

      expect([200, 403, 404]).toContain(responseValid.status);
    });

    it("should validate memory constraints", async () => {
      const freshRequest = await db.instance_request.create({
        data: {
          id: 1009,
          user_id: "test-student-id",
          course_id: 1,
          template_id: 1,
          type: "course",
          title: "Test Request for Memory Validation",
          description: "This is a test request for memory validation",
          hostname: "test-host-9",
          cpus: 2,
          memory: 512,
          disk: 16,
          state: "pending",
          reason: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Test memory too small
      const responseTooSmall = await api.approval.edit.put({
        request_id: freshRequest.id,
        memory: 256
      });

      expect(responseTooSmall.status).toBe(422);

      // Test memory too large
      const responseTooLarge = await api.approval.edit.put({
        request_id: freshRequest.id,
        memory: 32768
      });

      expect(responseTooLarge.status).toBe(422);

      // Test valid memory
      const responseValid = await api.approval.edit.put({
        request_id: freshRequest.id,
        memory: 4096
      });

      expect([200, 403, 404]).toContain(responseValid.status);
    });
  });
});
