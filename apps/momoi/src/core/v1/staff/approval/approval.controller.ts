import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { auth_service } from "@momoi/core/auth/auth.service";

import { BadRequestError, ForbiddenError, NotFoundError } from "@momoi/shared/errors";

import { warpper } from "@akikungz/warpper-ts";

import { ApprovalService } from "./approval.service";

export const ApprovalController = new Elysia({
  name: "staff.approval.controller",
  prefix: "/approval",
  detail: {
    tags: ["Approval", "Staff"],
    description: "Staff approval related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, user, status }) => {
    if (!isStaff) {
      const error = new ForbiddenError("This endpoint is for staff only");
      console.log(user, isStaff);
      return status(error.code, { message: error.message });
    }
  })
  .get("/", async ({ user, query, status }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return { count: 0, totalPages: 0, data: [] };

    const { skip = 1, take = 10 } = query as { skip?: number, take?: number } || {};
    const result = await ApprovalService.getApprovals(staff_id, { skip, take });

    return status(200, {
      message: "Get pending approvals",
      data: result
    });
  }, {
    description: "Get pending approvals for the staff",
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number({ minimum: 1, default: 1 })),
      take: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    })),
  })
  .get("/extends", async ({ query, status }) => {
    const { skip = 1, take = 10 } = query as { skip?: number, take?: number } || {};
    const result = await ApprovalService.getExtendsRequests({ skip, take });
    return status(200, {
      message: "Get pending extension requests",
      data: result
    });
  }, {
    description: "Get pending extension requests",
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number({ minimum: 1, default: 1 })),
      take: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    })),
  })
  .post("/approve", async ({ user, body, status }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return status(403, { message: "Forbidden" });
    const { request_id } = body;
    const [err, approval] = await warpper(ApprovalService.approveRequest, [{ request_id }, staff_id]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!approval) {
      const error = new NotFoundError("Request not found or you don't have permission to approve it");

      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Request approved", data: approval });
  }, {
    description: "Approve a request",
    body: t.Object({
      request_id: t.Number()
    })
  })
  .post("/extends/approve", async ({ body, status }) => {
    const { request_id } = body;
    const [err, approval] = await warpper(ApprovalService.approveExtendsRequest, [{ request_id }]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!approval) {
      const error = new NotFoundError("Extension request not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Extension request approved", data: approval });
  }, {
    description: "Approve an extension request",
    body: t.Object({
      request_id: t.Number()
    })
  })
  .post("/reject", async ({ user, body, status }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return status(403, { message: "Forbidden" });
    const { request_id, reason } = body;

    const [err, rejection] = await warpper(ApprovalService.rejectRequest, [{ request_id, reason }, staff_id]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!rejection) {
      const error = new NotFoundError("Request not found or you don't have permission to reject it");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Request rejected", data: rejection });
  }, {
    description: "Reject a request",
    body: t.Object({
      request_id: t.Number(),
      reason: t.String()
    })
  })
  .post("/extends/reject", async ({ body, status }) => {
    const { request_id, reason } = body;
    const [err, rejection] = await warpper(ApprovalService.rejectExtendsRequest, [{ request_id, reason }]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!rejection) {
      const error = new NotFoundError("Extension request not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Extension request rejected", data: rejection });
  }, {
    description: "Reject an extension request",
    body: t.Object({
      request_id: t.Number(),
      reason: t.String()
    })
  })
  .put("/edit", async ({ user, body, status }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return status(403, { message: "Forbidden" });
    const { request_id, cpus, memory, disk } = body;

    const [err, updatedRequest] = await warpper(ApprovalService.editRequest, [{ request_id, cpus, memory, disk }, staff_id]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!updatedRequest) {
      const error = new NotFoundError("Request not found or you don't have permission to edit it");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Request specification updated successfully", data: updatedRequest });
  }, {
    description: "Edit a pending request specification (CPU, memory, disk only)",
    body: t.Object({
      request_id: t.Number(),
      cpus: t.Optional(t.Number({ minimum: 1, maximum: 8 })),
      memory: t.Optional(t.Number({ minimum: 512, maximum: 16384 })),
      disk: t.Optional(t.Number({ minimum: 8, maximum: 32 }))
    })
  })
  .get("/stats", async ({ user, status }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return status(403, { message: "Forbidden" });

    const [err, stats] = await warpper(ApprovalService.getApprovalStats, [staff_id]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Get approval statistics",
      data: stats
    });
  })