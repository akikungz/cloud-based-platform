import { auto_complete } from "@momoi/modules/auto_complete";
import { Elysia } from "elysia";
import { auto_complete_api } from "./auto_complete";
import { staff_api } from "./staff";

export const v1 = new Elysia({ prefix: "/v1" })
	.use(staff_api)
	.use(auto_complete_api)