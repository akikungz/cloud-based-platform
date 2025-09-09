import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { InstanceService } from "./instances.service";

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
    const instances = await InstanceService.getInstances(user.id);

    return status(200, { message: "Instances fetched successfully", data: instances });
  })
  .get("/:id", async ({ status, user, params }) => {
    const instance = await InstanceService.getInstanceById(user.id, params.id);

    if (!instance) {
      return status(404, { message: "Instance not found" });
    }

    return status(200, { message: "Instance fetched successfully", data: instance });
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .delete("/:id", async ({ status, user, params }) => {
    const result = await InstanceService.deleteInstance(user.id, params.id);

    if (!result) {
      return status(404, { message: "Instance not found or already deleted/archived" });
    }

    return status(200, { message: "Instance deleted successfully", data: result });
  }, {
    params: t.Object({
      id: t.Number()
    })
  });
