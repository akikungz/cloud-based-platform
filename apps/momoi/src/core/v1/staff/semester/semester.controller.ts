import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { SemesterService } from "./semester.service";

import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const SemesterController = new Elysia({
  name: "staff.semester.controller",
  prefix: "/semester"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, semesters] = await create_callback<
      BadRequestError, typeof SemesterService.getSemesters
    >(SemesterService.getSemesters, query?.skip, query?.take);

    if (err) {
      return status(err.code, { message: err.message });
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
    )
  })
  .post("/", async ({ status, body }) => {
    const [err, semester] = await create_callback<
      BadRequestError | ConflictError, typeof SemesterService.createSemester
    >(SemesterService.createSemester, body);

    if (err) {
      return status(err.code, { message: err.message });
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
    })
  })
  .get("/active", async ({ status }) => {
    const [err, activeSemester] = await create_callback<
      BadRequestError | NotFoundError | ConflictError,
      typeof SemesterService.getActiveSemester
    >(SemesterService.getActiveSemester);

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!activeSemester) {
      return status(404, { message: "No active semester found" });
    }

    return status(200, {
      message: "Active semester fetched successfully",
      data: activeSemester
    });
  })
  .put("/:id", async ({ status, params, body }) => {
    const [err, semester] = await create_callback<
      BadRequestError | NotFoundError | ConflictError,
      typeof SemesterService.updateSemester
    >(SemesterService.updateSemester, params.id, body);

    if (err) {
      return status(err.code, { message: err.message });
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
    })
  })
  .post("/:id/activate", async ({ status, params }) => {
    const [err, semester] = await create_callback<
      BadRequestError | NotFoundError, typeof SemesterService.activateSemester
    >(SemesterService.activateSemester, params.id);

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, {
      message: "Semester activated successfully",
      data: semester
    });
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .delete("/:id", async ({ status, params }) => {
    const [err, deletedSemester] = await create_callback<
      BadRequestError | NotFoundError | ConflictError, typeof SemesterService.deleteSemester
    >(SemesterService.deleteSemester, params.id);

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, {
      message: "Semester deleted successfully"
    });
  }, {
    params: t.Object({
      id: t.Number()
    })
  });