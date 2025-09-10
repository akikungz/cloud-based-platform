import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { SemesterService } from "./semester.service";

export const SemesterController = new Elysia({
  name: "staff.semester.controller",
  prefix: "/semester"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status }) => {
    try {
      const semesters = await SemesterService.getSemesters();
      return status(200, { 
        message: "Semesters fetched successfully",
        data: semesters
      });
    } catch (error) {
      return status(500, { 
        message: "Failed to fetch semesters",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  })
  .post("/", async ({ status, body }) => {
    try {
      const semester = await SemesterService.createSemester(body);
      return status(201, { 
        message: "Semester created successfully",
        data: semester
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        return status(400, { 
          message: error.message
        });
      }
      return status(500, { 
        message: "Failed to create semester",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      start_at: t.Date(),
      end_at: t.Date(),
      active: t.Optional(t.Boolean())
    })
  })
  .get("/active", async ({ status }) => {
    try {
      const activeSemester = await SemesterService.getActiveSemester();
      return status(200, { 
        message: "Active semester fetched successfully",
        data: activeSemester
      });
    } catch (error) {
      return status(500, { 
        message: "Failed to fetch active semester",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  })
  .put("/:id", async ({ status, params, body }) => {
    try {
      const semester = await SemesterService.updateSemester(params.id, body);
      return status(200, { 
        message: "Semester updated successfully",
        data: semester
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return status(404, { 
          message: error.message
        });
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        return status(400, { 
          message: error.message
        });
      }
      return status(500, { 
        message: "Failed to update semester",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      start_at: t.Optional(t.Date()),
      end_at: t.Optional(t.Date()),
      active: t.Optional(t.Boolean())
    })
  })
  .post("/:id/activate", async ({ status, params }) => {
    try {
      const semester = await SemesterService.activateSemester(params.id);
      return status(200, { 
        message: "Semester activated successfully",
        data: semester
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return status(404, { 
          message: error.message
        });
      }
      return status(500, { 
        message: "Failed to activate semester",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .delete("/:id", async ({ status, params }) => {
    try {
      await SemesterService.deleteSemester(params.id);
      return status(200, { 
        message: "Semester deleted successfully"
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return status(404, { 
          message: error.message
        });
      }
      if (error instanceof Error && error.message.includes("associated instances")) {
        return status(400, { 
          message: error.message
        });
      }
      return status(500, { 
        message: "Failed to delete semester",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    params: t.Object({
      id: t.Number()
    })
  });