import { Elysia } from "elysia";

import { AutocompleteController } from "@momoi/core/v1/autocomplete/autocomplete.controller";
import { StaffController } from "@momoi/core/v1/staff/staff.controller";
import { StudentController } from "@momoi/core/v1/student/student.controller";

export const v1 = new Elysia({ prefix: "/api/v1" })
  .use(AutocompleteController)
  .use(StaffController)
  .use(StudentController)