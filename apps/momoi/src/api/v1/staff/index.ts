import { authModule } from "@momoi/modules/auth";
import { Elysia } from "elysia";

export const staff_api = new Elysia({
	prefix: "/staff",
	detail: {
		description: "Staff management API",
		operationId: "staffApi",
		tags: ["Staff"]
	}
})
	.use(authModule)
	.guard({ auth: true })
