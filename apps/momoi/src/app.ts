import { Elysia } from "elysia";

import { api } from "./routes/api";
import { v1 } from "./routes/api.v1";
import { semester_cron } from "./core/cron/semester.cron";

export const app = new Elysia()
  .use(api)
  .use(v1)
  .use(semester_cron);

export type App = typeof app;
