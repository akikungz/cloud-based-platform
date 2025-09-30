import { Elysia } from "elysia";

import { InstancesController } from "@momoi/core/v1/student/instances/instances.controller";
import { RequestsController } from "@momoi/core/v1/student/requests/requests.controller";

export const StudentController = new Elysia({
  name: "student.controller",
  prefix: "/student",
  detail: {
    tags: ["Student"],
    description: "Student related endpoints"
  }
})
  .use(InstancesController)
  .use(RequestsController);