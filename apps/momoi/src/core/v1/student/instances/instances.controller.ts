import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { InstanceService } from "./instances.service";

import { BadRequestError, NotFoundError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const InstancesController = new Elysia({
  name: "student.instances.controller",
  prefix: "/instances"
})
  .use(env.NODE_ENV === "test" ? mockAuthStudent : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, user }) => {
    const [err, instances] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof InstanceService.getInstances>>
    >(
      () => InstanceService.getInstances(user.id)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!instances) {
      const error = new NotFoundError("Instances not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Instances fetched successfully", data: instances });
  })
  .get("/:id", async ({ status, user, params }) => {
    const [err, instance] = await create_callback<
      BadRequestError | NotFoundError, Awaited<ReturnType<typeof InstanceService.getInstanceById>>
    >(
      () => InstanceService.getInstanceById(user.id, params.id)
    );

    if (err) {
      return status(err.code, { message: err.message });
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
    const [err, result] = await create_callback<
      BadRequestError | NotFoundError, Awaited<ReturnType<typeof InstanceService.deleteInstance>>
    >(
      () => InstanceService.deleteInstance(user.id, params.id)
    );

    if (err) {
      return status(err.code, { message: err.message });
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
