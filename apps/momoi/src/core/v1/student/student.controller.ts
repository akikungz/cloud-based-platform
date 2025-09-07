import { Elysia } from "elysia";
import { requests_controller } from "./requests/requests.controller";

export const student_controller = new Elysia({
  name: "student.controller",
  prefix: "/student"
})
  .use(requests_controller);