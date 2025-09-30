import { Elysia } from "elysia";
import { record } from "@elysiajs/opentelemetry";

import { auth } from "@momoi/libs/auth";

export const auth_controller = new Elysia({
  name: "auth.controller",
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
    description: "Authentication related endpoints"
  }
})
  .mount("/", (ctx) => record("auth.handler", () => auth.handler(ctx)));
