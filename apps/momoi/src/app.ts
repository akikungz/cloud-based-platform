import { Elysia } from "elysia";

import { api } from "./routes/api";
import { v1 } from "./routes/api.v1";

export const app = new Elysia()
  .use(api)
  .use(v1);

export type App = typeof app;
