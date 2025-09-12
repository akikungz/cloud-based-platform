import { Elysia, t } from "elysia";
import { instance_request_type } from "database/generated/prismabox/barrel";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";
import { db } from "@momoi/libs/db";

import { RequestsService } from "./requests.service";

import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

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
    const [err1, requests] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof RequestsService.getRequests>>
    >(
      () => RequestsService.getRequests(user.id)
    );

    if (err1) {
      return status(err1.code, { message: err1.message });
    }

    if (!requests) {
      const error = new NotFoundError("Requests not found");
      return status(error.code, { message: error.message });
    }

    const [err2, extend_requests] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof RequestsService.getExtendRequests>>
    >(
      () => RequestsService.getExtendRequests(user.id)
    );

    if (err2) {
      return status(err2.code, { message: err2.message });
    }

    if (!extend_requests) {
      const error = new NotFoundError("Requests not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Student requests controller", data: { requests, extend_requests } });
  })
  .post("/", async ({ status, user, body }) => {
    const [err, result] = await create_callback<
      BadRequestError | ConflictError, Awaited<ReturnType<typeof RequestsService.createRequest>>
    >(
      () => RequestsService.createRequest(user.id, body)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!result) {
      const error = new NotFoundError("Request creation failed");
      return status(error.code, { message: error.message });
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
    })
  })
  .post("/extends", async ({ status, body, user }) => {
    const [err, result] = await create_callback<
      BadRequestError | NotFoundError | ConflictError, Awaited<ReturnType<typeof RequestsService.createRequestExtends>>
    >(
      () => RequestsService.createRequestExtends(body, user.id, db)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!result) {
      const error = new NotFoundError("Request creation failed");
      return status(error.code, { message: error.message });
    }

    return status(201, { message: "Create a new extends request", data: result });
  }, {
    body: t.Object({
      instance_id: t.Number(),
      title: t.String(),
      description: t.String(),
    })
  })
  .post("/create-instance", async ({ status, user, body }) => {
    const [err, result] = await create_callback<
      BadRequestError | NotFoundError | ConflictError, Awaited<ReturnType<typeof RequestsService.createInstanceFromRequest>>
    >(
      () => RequestsService.createInstanceFromRequest(body.request_id, user.id)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!result) {
      const error = new NotFoundError("Instance creation failed");
      return status(error.code, { message: error.message });
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
    })
  })
