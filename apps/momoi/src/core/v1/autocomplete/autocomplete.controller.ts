import { Elysia } from "elysia";
import { AutoCompleteService } from "./autocomplete..service";

export const autocomplete_controller = new Elysia({
  name: "autocomplete.controller",
  prefix: "/autocomplete"
})
  .get("/course", async ({ status }) => {
    const result = await AutoCompleteService.getCourse();

    return status(200, {
      message: "Get course autocomplete",
      data: result
    });
  })
  .get("/staff", async ({ status }) => {
    const result = await AutoCompleteService.getStaff();

    return status(200, {
      message: "Get staff autocomplete",
      data: result
    });
  })
  .get("/staff/emails", async ({ status }) => {
    const result = await AutoCompleteService.getStaffEmails();

    return status(200, {
      message: "Get staff emails autocomplete",
      data: result
    });
  })
  .get("/template", async ({ status }) => {
    const result = await AutoCompleteService.getTemplate();

    return status(200, {
      message: "Get template autocomplete",
      data: result
    });
  });