import { Elysia } from "elysia";

import { SemesterService } from "@momoi/core/v1/staff/semester/semester.service";
import { BadRequestError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const PublicController = new Elysia({
  name: "public.controller",
  prefix: "/public",
  detail: {
    tags: ["Public"],
    description: "Publicly accessible endpoints"
  }
})
  .get("/active-semester", async ({ status }) => {
    const [err, activeSemester] = await warpper(SemesterService.getActiveSemester);

    if (err) {
      return status(500, { message: err.message });
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
    const [err, nextSemester] = await warpper(SemesterService.getNextSemester);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!nextSemester) {
      return status(404, { message: "No next semester found" });
    }

    return status(200, {
      message: "Next semester fetched successfully",
      data: nextSemester
    });
  });
