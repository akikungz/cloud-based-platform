import { Elysia, t } from "elysia";
import { instance_request_type } from "database/generated/prismabox/barrel";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { RequestsService } from "./requests.service";

export const RequestsController = new Elysia({
  name: "student.requests.controller",
  prefix: "/requests"
})
  .use(env.NODE_ENV === "test" ? mockAuthStudent : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, user }) => {
    const requests = await RequestsService.getRequests(user.id);
    const extend_requests = await RequestsService.getExtendRequests(user.id);

    return status(200, { message: "Student requests controller", data: { requests, extend_requests } });
  })
  .post("/", async ({ status, user, body }) => {
    try {
      const result = await RequestsService.createRequest(user.id, body);
      return status(201, { message: "Create a new request", data: result });
    } catch (error) {
      console.error("Error creating request:", error);
      return status(500, { message: "Failed to create request", error });
    }
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      type: instance_request_type,
      hostname: t.String(),
      course_id: t.Number(),
      template_id: t.Number(),
      cpus: t.Number({ minimum: 1, maximum: 8 }),
      memory: t.Number({ minimum: 256, maximum: 8192 }),
      disk: t.Number({ minimum: 8, maximum: 32 }),
    })
  })
  .post("/extends", async ({ status, body, user }) => {
    const result = await RequestsService.createRequestExtends(body, user.id);

    if (!result) {
      return status(404, { message: "Instance not found or does not belong to the user" });
    }

    return status(201, { message: "Create a new extends request", data: result });
  }, {
    body: t.Object({
      instance_id: t.Number(),
      title: t.String(),
      description: t.String(),
    })
  })
