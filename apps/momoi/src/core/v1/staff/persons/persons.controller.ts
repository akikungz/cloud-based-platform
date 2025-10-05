import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { PersonsService } from "./persons.service";

import { BaseError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const PersonsController = new Elysia({
  name: "persons.controller",
  prefix: "/persons",
  detail: {
    tags: ["Persons", "Staff"],
    description: "Staff persons related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, persons] = await warpper(PersonsService.getPersons, [query?.skip, query?.take]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!persons) {
      return status(404, { message: "Persons not found" });
    }

    return status(200, { message: "Get all persons", data: persons });
  }, {
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number()),
      take: t.Optional(t.Number())
    }))
  })
  .get("/search", async ({ status, query }) => {
    const [err, person] = await warpper(PersonsService.getPersonsByEmail, [query.email]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    if (!person) {
      return status(404, { message: "Person not found" });
    }

    return status(200, { message: "Get person by email", data: person });
  }, {
    query: t.Object({
      email: t.String()
    })
  })
  .post("/", async ({ status, body }) => {
    const [err, person] = await warpper(PersonsService.createPerson, [body.email]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 409 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(201, { message: "Create a new person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  })
  .delete("/", async ({ status, body }) => {
    const [err, person] = await warpper(PersonsService.deletePerson, [body.email]);

    if (err) {
      if (err instanceof BaseError) {
        return status(err.code as 400 | 403 | 404 | 500, { message: err.message });
      }

      return status(500, { message: err.message });
    }

    return status(200, { message: "Delete a person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  });