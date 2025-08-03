import { authModule } from "@momoi/modules/auth";
import { Elysia } from "elysia";
import { test_api } from "./test";

export const staff_api = new Elysia({ prefix: "/staff" })
	.use(authModule)
	.guard({ auth: true })
	.use(test_api)
