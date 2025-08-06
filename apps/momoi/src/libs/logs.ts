import { elylog } from "@eajr/elylog";
import { Elysia } from "elysia";

export const logs = new Elysia({ name: "logs" })
  .use(elylog());
