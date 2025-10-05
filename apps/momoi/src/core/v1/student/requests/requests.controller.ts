import { Elysia, t } from "elysia";
import { instance_request_type } from "database/generated/prismabox/barrel";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";
import { db } from "@momoi/libs/db";

import { RequestsService } from "./requests.service";

import { BaseError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const RequestsController = new Elysia({
  name: "student.requests.controller",
  prefix: "/requests",
  detail: {
    tags: ["Requests", "Student"],
    description: "Student requests related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStudent : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, user }) => {
    const [err1, requests] = await warpper(RequestsService.getRequests, [user.id]);

    if (err1) {
      if (err1 instanceof BaseError) {
        return status(err1.code as 400 | 403 | 404 | 500, { message: err1.message });
      }
      return status(500, { message: err1.message });
    }

    if (!requests) {
      return status(404, { message: "Requests not found" });
    }

    const [err2, extend_requests] = await warpper(RequestsService.getExtendRequests, [user.id]);

    if (err2) {
      if (err2 instanceof BaseError) {
        return status(err2.code as 400 | 403 | 404 | 500, { message: err2.message });
      }
      return status(500, { message: err2.message });
    }

    if (!extend_requests) {
      return status(404, { message: "Requests not found" });
    }

    return status(200, { message: "Student requests controller", data: { requests, extend_requests } });
  }, {
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Any()
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
        message: t.String()
      }),
      404: t.Object({
        message: t.String()
      }),
      500: t.Object({
        message: t.String()
      })
    }
  })
  .post("/", async ({ status, user, body }) => {
    const [err, result] = await warpper(RequestsService.createRequest, [user.id, body]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 409 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!result) {
      return status(404, { message: "Request creation failed" });
    }

    return status(201, { message: "Create a new request", data: result });
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
    }),
    response: {
      201: t.Object({
        message: t.String(),
        data: t.Any()
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
        message: t.String()
      }),
      404: t.Object({
        message: t.String()
      }),
      409: t.Object({
        message: t.String()
      }),
      500: t.Object({
        message: t.String()
      })
    }
  })
  .post("/extends", async ({ status, body, user }) => {
    const [err, result] = await warpper(() => RequestsService.createRequestExtends(body, user.id, db));

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 409 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!result) {
      return status(404, { message: "Request creation failed" });
    }

    return status(201, { message: "Create a new extends request", data: result });
  }, {
    body: t.Object({
      instance_id: t.Number(),
      title: t.String(),
      description: t.String(),
    }),
    response: {
      201: t.Object({
        message: t.String(),
        data: t.Any()
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
        message: t.String()
      }),
      404: t.Object({
        message: t.String()
      }),
      409: t.Object({
        message: t.String()
      }),
      500: t.Object({
        message: t.String()
      })
    }
  })
  .post("/create-instance", async ({ status, user, body }) => {
    const [err, result] = await warpper(RequestsService.createInstanceFromRequest, [body.request_id, user.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 409 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!result) {
      return status(404, { message: "Instance creation failed" });
    }

    // Return the request data in the format expected by the frontend/tests
    // The actual instance creation is now handled by the yuzu service
    return status(201, {
      message: "Instance creation initiated successfully",
      data: {
        id: result.requestId,
        title: result.request.title,
        hostname: result.request.hostname,
        description: result.request.description,
        type: result.request.type,
        cpus: result.request.cpus,
        memory: result.request.memory,
        disk: result.request.disk,
        vmid: result.vmid,
        node: result.node,
        status: 'pending' // Instance creation is now asynchronous
      }
    });
  }, {
    body: t.Object({
      request_id: t.Number()
    }),
    response: {
      201: t.Object({
        message: t.String(),
        data: t.Any()
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
        message: t.String()
      }),
      404: t.Object({
        message: t.String()
      }),
      409: t.Object({
        message: t.String()
      }),
      500: t.Object({
        message: t.String()
      })
    }
  })
