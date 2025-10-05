import { Elysia, t } from "elysia";

import env from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { StaffInstanceService } from "./instances.service";

import { BaseError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const StaffInstancesController = new Elysia({
  name: "staff.instances.controller",
  prefix: "/instances",
  detail: {
    tags: ["Instances", "Staff"],
    description: "Staff instances related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, instances] = await warpper(StaffInstanceService.getAllInstances);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!instances) {
      return status(404, { message: "Instances not found" });
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
    const [err, stats] = await warpper(StaffInstanceService.getInstancesStats);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!stats) {
      return status(404, { message: "Instance statistics not found" });
    }

    return status(200, {
      message: "Instance statistics fetched successfully",
      data: stats
    });
  })
  .get("/:id", async ({ status, params }) => {
    const [err, instance] = await warpper(StaffInstanceService.getInstanceById, [params.id]);

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
    })
  })
  .post("/create", async ({ status, body }) => {
    const [err, instance] = await warpper(StaffInstanceService.createInstanceDirectly, [body]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!instance) {
      return status(400, { message: "Instance creation failed" });
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
    const [err, templates] = await warpper(StaffInstanceService.getAvailableTemplates);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Templates fetched successfully",
      data: templates
    });
  })
  .get("/courses", async ({ status }) => {
    const [err, courses] = await warpper(StaffInstanceService.getAvailableCourses);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Courses fetched successfully",
      data: courses
    });
  })
  .get("/semesters", async ({ status }) => {
    const [err, semesters] = await warpper(StaffInstanceService.getAvailableSemesters);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Semesters fetched successfully",
      data: semesters
    });
  })
  .post("/:id/archive", async ({ status, params }) => {
    const [err, instance] = await warpper(StaffInstanceService.archiveInstance, [params.id]);

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
      message: "Instance archived successfully (marked as permanent storage)",
      data: instance
    });
  }, {
    description: "Archive an instance to mark it as permanent storage. Archived instances are not deleted during semester cleanup.",
    params: t.Object({
      id: t.Number()
    })
  })
  .post("/:id/unarchive", async ({ status, params }) => {
    const [err, instance] = await warpper(StaffInstanceService.unarchiveInstance, [params.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!instance) {
      return status(404, { message: "Archived instance not found" });
    }

    return status(200, {
      message: "Instance unarchived successfully (restored to active state)",
      data: instance
    });
  }, {
    description: "Unarchive an instance to restore it to active state",
    params: t.Object({
      id: t.Number()
    })
  })
  .delete("/:id", async ({ status, params }) => {
    const [err, instance] = await warpper(StaffInstanceService.deleteInstance, [params.id]);

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
      message: "Instance deleted successfully. VM deletion request sent to Proxmox.",
      data: instance
    });
  }, {
    description: "Delete an instance. This will remove the VM from Proxmox and mark it as deleted in the database.",
    params: t.Object({
      id: t.Number()
    })
  })
  .post("/:id/status", async ({ status, params, body }) => {
    const [err, instance] = await warpper(StaffInstanceService.changeVMStatus, [params.id, body.action]);

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
    description: "Change VM status (start, stop, suspend, resume, reboot)",
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
    })
  });
