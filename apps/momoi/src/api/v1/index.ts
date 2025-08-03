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
	})
	.use(staff_api);
