import { Elysia } from "elysia";
import { AutoCompleteService } from "./autocomplete.service";

import { BadRequestError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const AutocompleteController = new Elysia({
  name: "autocomplete.controller",
  prefix: "/autocomplete",
  detail: {
    tags: ["Autocomplete"],
    description: "Autocomplete related endpoints"
  }
})
  .get("/course", async ({ status }) => {
    const [err, result] = await warpper(AutoCompleteService.getCourse);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!result) {
      const error = new BadRequestError("Course not found");
      return status(error.code, { message: error.message });
    }

    return status(200, {
      message: "Get course autocomplete",
      data: result
    });
  })
  .get("/staff", async ({ status }) => {
    const [err, result] = await warpper(AutoCompleteService.getStaff);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!result) {
      const error = new BadRequestError("Staff not found");
      return status(error.code, { message: error.message });
    }

    return status(200, {
      message: "Get staff autocomplete",
      data: result
    });
  })
  .get("/staff/emails", async ({ status }) => {
    const [err, result] = await warpper(AutoCompleteService.getStaffEmails);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!result) {
      const error = new BadRequestError("Staff emails not found");
      return status(error.code, { message: error.message });
    }

    return status(200, {
      message: "Get staff emails autocomplete",
      data: result
    });
  })
  .get("/template", async ({ status }) => {
    const [err, result] = await warpper(AutoCompleteService.getTemplate);

    if (err) {
      return status(500, { message: err.message });
    }

    if (!result) {
      const error = new BadRequestError("Template not found");
      return status(error.code, { message: error.message });
    }

    return status(200, {
      message: "Get template autocomplete",
      data: result
    });
  });