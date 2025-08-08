import { Elysia } from "elysia";
import { staff_api } from "./staff";

export const v1 = new Elysia({ prefix: "/v1" })
	.use(staff_api);
