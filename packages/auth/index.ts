import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSessionClient } from "better-auth/client/plugins";
import { customSession, openAPI } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
import { auth_schema, db } from "db";
import { append, getRoleFromEmail, omit } from "utils";

export interface AuthEnv {
	baseURL: string;
	basePath: string;
	TRUSTED_ORIGINS: string[];
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	BACKEND_API_URL: string;
	FRONTEND_BASE_URL: string;
	LOG_LEVEL?: "info" | "debug" | "warn" | "error";
	DATABASE_URL: string;
}

export const auth = (env: AuthEnv) =>
	betterAuth({
		database: drizzleAdapter(db(env.DATABASE_URL), {
			provider: "pg",
			schema: {
				account: auth_schema.account,
				session: auth_schema.session,
				user: auth_schema.user,
				verification: auth_schema.verification,
			},
		}),
		baseURL: env.BACKEND_API_URL,
		basePath: "/api/auth",
		trustedOrigins: env.TRUSTED_ORIGINS,
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				redirectURI: `${env.BACKEND_API_URL}/api/v1/auth/callback/google`,
				scope: ["profile", "email"],
			},
		},
		account: {
			accountLinking: {
				enabled: true,
				allowDifferentEmails: true,
			},
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 60 * 60 * 24 * 7, // 7 days
			},
		},
		logger: {
			disabled: false,
			level: env.LOG_LEVEL || "info",
			transports: [
				{
					type: "console",
					options: {
						format: "json",
					},
				},
			],
			log: (level, message, meta) => {
				console[level](`${message} ${meta ? JSON.stringify(meta) : ""}`);
			},
		},
		plugins: [
			openAPI(),
			customSession(async ({ user, session }) => {
				const role = getRoleFromEmail(user.email);

				return {
					user: append(
						omit(user, ["createdAt", "updatedAt", "emailVerified"]),
						"role",
						role,
					),
					session,
				};
			}),
		],
	});

export type Auth = ReturnType<typeof auth>;

export const authClient = (url: string) =>
	createAuthClient({
		baseURL: url,
		fetchOptions: {
			headers: {
				"Content-Type": "application/json",
			},
		},
		plugins: [customSessionClient<Auth>()],
	});
