import { Elysia } from "elysia";
import { AutoCompleteService } from "./autocomplete.service";

import { BadRequestError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const AutocompleteController = new Elysia({
  name: "autocomplete.controller",
  prefix: "/autocomplete"
})
  .get("/course", async ({ status }) => {
    const [err, result] = await create_callback<BadRequestError, typeof AutoCompleteService.getCourse>(AutoCompleteService.getCourse);

    if (err) {
      return status(err.code, { message: err.message });
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
    const [err, result] = await create_callback<BadRequestError, typeof AutoCompleteService.getStaff>(AutoCompleteService.getStaff);

    if (err) {
      return status(err.code, { message: err.message });
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
    const [err, result] = await create_callback<BadRequestError, typeof AutoCompleteService.getStaffEmails>(AutoCompleteService.getStaffEmails);

    if (err) {
      return status(err.code, { message: err.message });
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
    const [err, result] = await create_callback<BadRequestError, typeof AutoCompleteService.getTemplate>(AutoCompleteService.getTemplate);

    if (err) {
      return status(err.code, { message: err.message });
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