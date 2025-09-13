import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { PersonsService } from "./persons.service";

import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { create_callback } from "utils/functions/callback";

export const PersonsController = new Elysia({
  name: "persons.controller",
  prefix: "/persons"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, persons] = await create_callback<
      BadRequestError, Awaited<ReturnType<typeof PersonsService.getPersons>>
    >(
      () => PersonsService.getPersons(query?.skip, query?.take)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!persons) {
      const error = new NotFoundError("Persons not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Get all persons", data: persons });
  }, {
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number()),
      take: t.Optional(t.Number())
    }))
  })
  .get("/search", async ({ status, query }) => {
    const [err, person] = await create_callback<
      BadRequestError | NotFoundError, Awaited<ReturnType<typeof PersonsService.getPersonsByEmail>>
    >(
      () => PersonsService.getPersonsByEmail(query.email)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    if (!person) {
      const error = new NotFoundError("Person not found");
      return status(error.code, { message: error.message });
    }

    return status(200, { message: "Get person by email", data: person });
  }, {
    query: t.Object({
      email: t.String()
    })
  })
  .post("/", async ({ status, body }) => {
    const [err, person] = await create_callback<
      BadRequestError | ConflictError, Awaited<ReturnType<typeof PersonsService.createPerson>>
    >(
      () => PersonsService.createPerson(body.email)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(201, { message: "Create a new person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  })
  .delete("/", async ({ status, body }) => {
    const [err, person] = await create_callback<
      BadRequestError | NotFoundError, Awaited<ReturnType<typeof PersonsService.deletePerson>>
    >(
      () => PersonsService.deletePerson(body.email)
    );

    if (err) {
      return status(err.code, { message: err.message });
    }

    return status(200, { message: "Delete a person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  });