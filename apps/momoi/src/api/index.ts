import { auth } from "@momoi/modules/auth";
import Elysia from "elysia";
import { v1 } from "./v1";

export const api = new Elysia({
	prefix: "/api",
	name: "API",
})
	.use(v1)
	.mount(auth.handler);
