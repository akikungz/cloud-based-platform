import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { StaffInstanceService } from "./instances.service";

import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
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
    const skip = query?.skip ? query.skip : 0;
    const take = query?.take ? query.take : 50;
    
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
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number()),
      take: t.Optional(t.Number())
    }))
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
  })
  .post("/create", async ({ status, body }) => {
    const [err, instance] = await create_callback<
      BadRequestError | NotFoundError | ConflictError, Awaited<ReturnType<typeof StaffInstanceService.createInstanceDirectly>>
    >(
      () => StaffInstanceService.createInstanceDirectly(body)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!instance) {
      const error = new BadRequestError("Instance creation failed");
      return status(error.code, { message: error.message });
    }

    return status(201, { 
      message: "Instance created successfully", 
      data: instance 
    });
  }, {
    body: t.Object({
      user_id: t.String(),
      title: t.String(),
      hostname: t.String(),
      description: t.String(),
      type: t.Union([t.Literal('course'), t.Literal('personal')]),
      course_id: t.Number(),
      template_id: t.Number(),
      cpus: t.Number(),
      memory: t.Number(),
      disk: t.Number(),
      semester_id: t.Optional(t.Number())
    })
  })
  .get("/templates", async ({ status }) => {
    const [err, templates] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof StaffInstanceService.getAvailableTemplates>>
    >(
      () => StaffInstanceService.getAvailableTemplates()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, { 
      message: "Templates fetched successfully", 
      data: templates 
    });
  })
  .get("/courses", async ({ status }) => {
    const [err, courses] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof StaffInstanceService.getAvailableCourses>>
    >(
      () => StaffInstanceService.getAvailableCourses()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, { 
      message: "Courses fetched successfully", 
      data: courses 
    });
  })
  .get("/semesters", async ({ status }) => {
    const [err, semesters] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof StaffInstanceService.getAvailableSemesters>>
    >(
      () => StaffInstanceService.getAvailableSemesters()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, { 
      message: "Semesters fetched successfully", 
      data: semesters 
    });
  });
