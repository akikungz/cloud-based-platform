import { Elysia } from "elysia";

import { ApprovalController } from "./approval/approval.controller";
import { PersonsController } from "./persons/persons.controller";

export const StaffController = new Elysia({
  name: "staff.controller",
  prefix: "/staff"
})
  .use(ApprovalController)
  .use(PersonsController)
