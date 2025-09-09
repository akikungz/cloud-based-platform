import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { auth_service } from "@momoi/core/auth/auth.service";
import { ApprovalService } from "./approval.service";

export const ApprovalController = new Elysia({
  name: "staff.approval.controller",
  prefix: "/approval"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (!isStaff) return status(403, { error: "Forbidden" });
  })
  .get("/", async ({ user: { staff_id }, query, status }) => {
    if (!staff_id) return { count: 0, totalPages: 0, data: [] };

    const { skip = 1, take = 10 } = query as { skip?: number, take?: number };
    const result = await ApprovalService.getApprovals(staff_id, { skip, take });

    return status(200, {
      message: "Get pending approvals",
      data: result
    });
  }, {
    description: "Get pending approvals for the staff",
    query: t.Object({
      skip: t.Optional(t.Number({ minimum: 1, default: 1 })),
      take: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    }),
  })
  .get("/extends", async ({ query, status }) => {
    const { skip = 1, take = 10 } = query as { skip?: number, take?: number };
    const result = await ApprovalService.getExtendsRequests({ skip, take });
    return status(200, {
      message: "Get pending extension requests",
      data: result
    });
  }, {
    description: "Get pending extension requests",
    query: t.Object({
      skip: t.Optional(t.Number({ minimum: 1, default: 1 })),
      take: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
    }),
  })
  .post("/approve", async ({ user: { staff_id }, body, status }) => {
    if (!staff_id) return status(403, { message: "Forbidden" });
    const { request_id } = body;

    const approval = await ApprovalService.approveRequest({ request_id }, staff_id);
    return status(200, { message: "Request approved", data: approval });
  }, {
    description: "Approve a request",
    body: t.Object({
      request_id: t.Number()
    })
  })
  .post("/extends/approve", async ({ body, status }) => {
    const { request_id } = body;
    const approval = await ApprovalService.approveExtendsRequest({ request_id });
    return status(200, { message: "Extension request approved", data: approval });
  }, {
    description: "Approve an extension request",
    body: t.Object({
      request_id: t.Number()
    })
  })
  .post("/reject", async ({ user: { staff_id }, body, status }) => {
    if (!staff_id) return status(403, { message: "Forbidden" });
    const { request_id, reason } = body;

    const rejection = await ApprovalService.rejectRequest({ request_id, reason }, staff_id);
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
    const rejection = await ApprovalService.rejectExtendsRequest({ request_id, reason });
    return status(200, { message: "Extension request rejected", data: rejection });
  }, {
    description: "Reject an extension request",
    body: t.Object({
      request_id: t.Number(),
      reason: t.String()
    })
  })