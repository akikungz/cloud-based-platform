import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { InstanceService } from "./instances.service";

import { BadRequestError, NotFoundError } from "@momoi/shared/errors";
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
      return status(500, { message: err.message });
    }

    if (!instances) {
      const error = new NotFoundError("Instances not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Instances fetched successfully", data: instances });
  })
  .get("/:id", async ({ status, user, params }) => {
    const [err, instance] = await warpper(InstanceService.getInstanceById, [user.id, params.id]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!instance) {
      const error = new NotFoundError("Instance not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Instance fetched successfully", data: instance });
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .delete("/:id", async ({ status, user, params }) => {
    const [err, result] = await warpper(InstanceService.deleteInstance, [user.id, params.id]);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!result) {
      const error = new NotFoundError("Instance not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Instance deleted successfully", data: result });
  }, {
    params: t.Object({
      id: t.Number()
    })
  });
