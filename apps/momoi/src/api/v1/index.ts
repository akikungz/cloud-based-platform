import { authModule } from "@momoi/modules/auth";
import { Elysia, t } from "elysia";
import { staff_api } from "./staff";

export const v1 = new Elysia({ prefix: "/v1" })
	.use(authModule)
	.guard({ auth: true })
	.get("/me", async ({ status, user }) => status(200, user), {
		response: {
			200: t.Object({
				id: t.String(),
				email: t.String(),
				name: t.String(),
				role: t.String(),
			}),
			401: t.Object({
				message: t.String(),
			}),
			500: t.Object({
				message: t.String(),
			}),
		},
		detail: {
			description: "Get current authenticated user",
			operationId: "getCurrentUser",
			tags: ["User"],
			responses: {
				200: {
					description: "Current user data",
				},
				401: {
					description: "Unauthorized access",
				},
				500: {
					description: "Internal server error",
				},
			},
		},
	})
	.use(staff_api);
