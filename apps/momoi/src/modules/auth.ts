import { record } from "@elysiajs/opentelemetry";
import { env } from "@momoi/libs/env";
import { auth as Auth } from "auth";
import { Elysia } from "elysia";

export const auth = Auth({
	...env,
	baseURL: env.BACKEND_API_URL,
	basePath: "/auth",
});

export const authModule = new Elysia({ name: "Auth Module" }).macro({
	auth: {
		resolve: async ({ status, request: { headers } }) => {
			const session = await record("auth.resolve", () =>
				auth.api.getSession({ headers }),
			);

			if (!session) return status(401, { message: "Unauthorized" });

			return {
				user: session.user,
			};
		},
	},
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
// biome-ignore lint/suspicious/noAssignInExpressions: lazy initialization pattern for caching schema
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
	getPaths: (prefix = "/api/auth") =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null);

			for (const path of Object.keys(paths)) {
				const key = prefix + path;
				reference[key] = paths[path];

				for (const method of Object.keys(paths[path])) {
					// biome-ignore lint/suspicious/noExplicitAny: <any>
					const operation = (reference[key] as any)[method];

					operation.tags = ["Better Auth"];
				}
			}

			return reference;
			// biome-ignore lint/suspicious/noExplicitAny: <any>
		}) as Promise<any>,
	// biome-ignore lint/suspicious/noExplicitAny: <any>
	components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
