import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { InstanceService } from "./instances.service";

import { BaseError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const InstancesController = new Elysia({
  name: "student.instances.controller",
  prefix: "/instances",
  detail: {
    tags: ["Instances", "Student"],
    description: "Student instances related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStudent : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, user }) => {
    const [err, instances] = await warpper(InstanceService.getInstances, [user.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!instances) {
      return status(404, { message: "Instances not found" });
    }

    return status(200, { message: "Instances fetched successfully", data: instances });
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
  .get("/:id", async ({ status, user, params }) => {
    const [err, instance] = await warpper(InstanceService.getInstanceById, [user.id, params.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!instance) {
      return status(404, { message: "Instance not found" });
    }

    return status(200, { message: "Instance fetched successfully", data: instance });
  }, {
    params: t.Object({
      id: t.Number()
    }),
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
  .delete("/:id", async ({ status, user, params }) => {
    const [err, result] = await warpper(InstanceService.deleteInstance, [user.id, params.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!result) {
      return status(404, { message: "Instance not found" });
    }

    return status(200, { message: "Instance deleted successfully", data: result });
  }, {
    params: t.Object({
      id: t.Number()
    }),
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
  .post("/:id/status", async ({ status, user, params, body }) => {
    const [err, instance] = await warpper(InstanceService.changeVMStatus, [user.id, params.id, body.action]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }
      return status(500, { message: err.message });
    }

    if (!instance) {
      return status(404, { message: "Instance not found" });
    }

    return status(200, {
      message: `VM ${body.action} request sent successfully`,
      data: instance
    });
  }, {
    description: "Change VM status (start, stop, suspend, resume, reboot). Students can only control their own VMs.",
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      action: t.Union([
        t.Literal('start'),
        t.Literal('stop'),
        t.Literal('suspend'),
        t.Literal('resume'),
        t.Literal('reboot')
      ])
    }),
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
  });
