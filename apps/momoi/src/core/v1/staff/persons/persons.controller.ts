import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";

import { PersonsService } from "./persons.service";

export const persons_controller = new Elysia({
  name: "persons.controller",
  prefix: "/persons"
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status }) => {
    const persons = await PersonsService.getPersons();
    return status(200, { message: "Get all persons", data: persons });
  })
  .get("/search", async ({ status, query }) => {
    const person = await PersonsService.getPersonsByEmail(query.email);
    return status(200, { message: "Get person by email", data: person });
  }, {
    query: t.Object({
      email: t.String()
    })
  })
  .post("/", async ({ status, body }) => {
    const person = await PersonsService.createPerson(body.email);
    return status(201, { message: "Create a new person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  })
  .delete("/", async ({ status, body }) => {
    const person = await PersonsService.deletePerson(body.email);
    return status(200, { message: "Delete a person", data: person });
  }, {
    body: t.Object({
      email: t.String()
    })
  });