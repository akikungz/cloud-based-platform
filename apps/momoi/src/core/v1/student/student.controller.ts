import { Elysia } from "elysia";

import { instances_controller } from "@momoi/core/v1/student/instances/instances.controller";
import { requests_controller } from "@momoi/core/v1/student/requests/requests.controller";

export const student_controller = new Elysia({
  name: "student.controller",
  prefix: "/student"
})
  .use(instances_controller)
  .use(requests_controller);