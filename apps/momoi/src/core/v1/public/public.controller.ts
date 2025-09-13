import { Elysia } from "elysia";

import { SemesterService } from "@momoi/core/v1/staff/semester/semester.service";
import { BadRequestError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const PublicController = new Elysia({
  name: "public.controller",
  prefix: "/public"
})
  .get("/active-semester", async ({ status }) => {
    const [err, activeSemester] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof SemesterService.getActiveSemester>>
    >(
      () => SemesterService.getActiveSemester()
    );

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
  .get("/next-semester", async ({ status }) => {
    const [err, nextSemester] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof SemesterService.getNextSemester>>
    >(
      () => SemesterService.getNextSemester()
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!nextSemester) {
      return status(404, { message: "No next semester found" });
    }

    return status(200, { 
      message: "Next semester fetched successfully",
      data: nextSemester
    });
  });
