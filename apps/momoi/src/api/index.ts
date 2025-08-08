import { record } from "@elysiajs/opentelemetry";
import { auth } from "@momoi/modules/auth";
import Elysia from "elysia";
import { v1 } from "./v1";

export const api = new Elysia({
	prefix: "/api",
	name: "API",
	detail: {
		description: "Main API for Momoi",
		operationId: "mainApi",
		tags: ["API"],
	},
})
	.use(v1)
	.mount((req) => record("auth.handler", () => auth.handler(req)));
