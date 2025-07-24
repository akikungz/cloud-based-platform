import { Elysia } from "elysia";

export const app = new Elysia().get("/", () => "Hello Elysia");

export type App = typeof app;
