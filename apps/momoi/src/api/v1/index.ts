import { authModule } from "@momoi/modules/auth";
import { Elysia, t } from "elysia";

export const v1 = new Elysia({ prefix: "/v1" })
	.use(authModule)
	.get("/me", async ({ status, user }) => status(200, user), {
		auth: true,
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
	});
