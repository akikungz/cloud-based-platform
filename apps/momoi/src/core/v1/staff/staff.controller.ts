import { Elysia } from "elysia";

import { ApprovalController } from "./approval/approval.controller";
import { CourseController } from "./course/course.controller";
import { PersonsController } from "./persons/persons.controller";
import { SemesterController } from "./semester/semester.controller";
import { StaffInstancesController } from "./instances/instances.controller";

export const StaffController = new Elysia({
  name: "staff.controller",
  prefix: "/staff",
  detail: {
    tags: ["Staff"],
    description: "Staff related endpoints"
  }
})
  .use(ApprovalController)
  .use(CourseController)
  .use(PersonsController)
  .use(SemesterController)
  .use(StaffInstancesController)
