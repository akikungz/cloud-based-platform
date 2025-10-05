import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { SemesterService } from "./semester.service";

import { BaseError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const SemesterController = new Elysia({
  name: "staff.semester.controller",
  prefix: "/semester",
  detail: {
    tags: ["Semester", "Staff"],
    description: "Staff semester related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, semesters] = await warpper(SemesterService.getSemesters, [query?.skip, query?.take]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Semesters fetched successfully",
      data: semesters
    });
  }, {
    query: t.Optional(
      t.Object({
        skip: t.Optional(t.Number()),
        take: t.Optional(t.Number())
      })
    ),
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Array(t.Object({
          id: t.Number(),
          name: t.String(),
          created_at: t.Date(),
          updated_at: t.Date(),
          start_at: t.Date(),
          end_at: t.Date(),
          active: t.Boolean()
        }))
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
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
  .post("/", async ({ status, body }) => {
    const [err, semester] = await warpper(SemesterService.createSemester, [body]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 409, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(201, {
      message: "Semester created successfully",
      data: semester
    });
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      start_at: t.Date(),
      end_at: t.Date(),
      active: t.Optional(t.Boolean())
    }),
    response: {
      201: t.Object({
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          created_at: t.Date(),
          updated_at: t.Date(),
          start_at: t.Date(),
          end_at: t.Date(),
          active: t.Boolean()
        })
      }),
      400: t.Object({
        message: t.String()
      }),
      403: t.Object({
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
  .get("/active", async ({ status }) => {
    const [err, activeSemester] = await warpper(SemesterService.getActiveSemester);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 404 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!activeSemester) {
      return status(404, { message: "No active semester found" });
    }

    return status(200, {
      message: "Active semester fetched successfully",
      data: activeSemester
    });
  }, {
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          created_at: t.Date(),
          updated_at: t.Date(),
          start_at: t.Date(),
          end_at: t.Date(),
          active: t.Boolean()
        })
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
  .put("/:id", async ({ status, params, body }) => {
    const [err, semester] = await warpper(SemesterService.updateSemester, [params.id, body]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 404 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Semester updated successfully",
      data: semester
    });
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      start_at: t.Optional(t.Date()),
      end_at: t.Optional(t.Date()),
      active: t.Optional(t.Boolean())
    }),
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          created_at: t.Date(),
          updated_at: t.Date(),
          start_at: t.Date(),
          end_at: t.Date(),
          active: t.Boolean()
        })
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
  .post("/:id/activate", async ({ status, params }) => {
    const [err, semester] = await warpper(SemesterService.activateSemester, [params.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 404 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Semester activated successfully",
      data: semester
    });
  }, {
    params: t.Object({
      id: t.Number()
    }),
    response: {
      200: t.Object({
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          created_at: t.Date(),
          updated_at: t.Date(),
          start_at: t.Date(),
          end_at: t.Date(),
          active: t.Boolean()
        })
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
  .delete("/:id", async ({ status, params }) => {
    const [err, deletedSemester] = await warpper(SemesterService.deleteSemester, [params.id]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 404 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Semester deleted successfully"
    });
  }, {
    params: t.Object({
      id: t.Number()
    }),
    response: {
      200: t.Object({
        message: t.String()
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
  });