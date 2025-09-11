import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { StaffInstanceService } from "./instances.service";

import { BadRequestError, NotFoundError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const StaffInstancesController = new Elysia({
  name: "staff.instances.controller",
  prefix: "/instances"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, instances] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof StaffInstanceService.getAllInstances>>
    >(
      () => StaffInstanceService.getAllInstances()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!instances) {
      const error = new NotFoundError("Instances not found");
      return status(error.code, { message: error.message });
    }

    // Apply pagination if provided
    const skip = query.skip ? parseInt(query.skip) : 0;
    const take = query.take ? parseInt(query.take) : 50;
    
    const paginatedInstances = instances.slice(skip, skip + take);

    return status(200, { 
      message: "Instances fetched successfully", 
      data: {
        instances: paginatedInstances,
        total: instances.length,
        skip,
        take
      }
    });
  }, {
    query: t.Object({
      skip: t.Optional(t.String()),
      take: t.Optional(t.String())
    })
  })
  .get("/stats", async ({ status }) => {
    const [err, stats] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof StaffInstanceService.getInstancesStats>>
    >(
      () => StaffInstanceService.getInstancesStats()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!stats) {
      const error = new NotFoundError("Instance statistics not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { 
      message: "Instance statistics fetched successfully", 
      data: stats 
    });
  })
  .get("/:id", async ({ status, params }) => {
    const [err, instance] = await create_callback<
      BadRequestError | NotFoundError, Awaited<ReturnType<typeof StaffInstanceService.getInstanceById>>
    >(
      () => StaffInstanceService.getInstanceById(params.id)
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
  });
