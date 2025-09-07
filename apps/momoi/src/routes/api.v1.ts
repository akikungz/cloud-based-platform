import { Elysia } from "elysia";

import { autocomplete_controller } from "@momoi/core/v1/autocomplete/autocomplete.controller";
import { staff_controller } from "@momoi/core/v1/staff/staff.controller";
import { student_controller } from "@momoi/core/v1/student/student.controller";

export const v1 = new Elysia({ prefix: "/api/v1" })
  .use(autocomplete_controller)
  .use(staff_controller)
  .use(student_controller)