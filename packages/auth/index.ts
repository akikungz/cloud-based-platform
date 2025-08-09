import { record } from "@elysiajs/opentelemetry";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, openAPI } from "better-auth/plugins";
import { auth_schema, better_auth, db as _db } from "db";
import { eq, or } from "drizzle-orm";
import { getRoleFromEmail, omit, Role, union } from "utils";

export interface AuthEnv {
	baseURL: string;
	basePath: string;
	TRUSTED_ORIGINS: string[];
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	API_URL: string;
	FRONTEND_BASE_URL: string;
	LOG_LEVEL?: "info" | "debug" | "warn" | "error";
	DATABASE_URL: string;
}

/**
 * Initializes the authentication system with the provided environment variables.
 * This function sets up the authentication client, session handling, and social providers.
 * It also configures logging and error handling for the authentication API.
 * @param env - The environment variables required for authentication.
 * @returns An instance of the authentication system.
 */
export const auth = (env: AuthEnv) => {
	const db = _db(env.DATABASE_URL);

	return betterAuth({
		database: record(
			"auth.database", 
			() => drizzleAdapter(db, {
				provider: "pg",
				schema: {
					account: better_auth.account,
					session: better_auth.session,
					user: better_auth.user,
					verification: better_auth.verification,
				},
			})
		),
		baseURL: env.API_URL,
		basePath: "/api/auth",
		trustedOrigins: ["*", ...(env.TRUSTED_ORIGINS || [])],
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				prompt: "select_account",
				redirectURI: `${env.API_URL}/api/auth/callback/google`,
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
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24, // 24 hours
			secret: env.GOOGLE_CLIENT_ID, // Use client ID as secret for simplicity
		},
		logger: {
			disabled: false,
			level: "debug",
			log: (level, message, ...meta) => {
				console[level](`${message} ${meta.length ? JSON.stringify(meta) : ""}`);
			},
		},
		plugins: [
			openAPI(),
			customSession(async ({ user, session }) => 
				record("auth.customSession", async () => {
					let role = getRoleFromEmail(user.email);

					if (role === Role.Staff) {
						role = await record("auth.getStaffRole", async () => {
							// Check is staff exists in the database
							try {
								const dbStaff = await db
									.select({
										id: auth_schema.staff_list.id,
										auth_itm: auth_schema.staff_list.auth_itm,
										auth_fitm: auth_schema.staff_list.auth_fitm,
										role: auth_schema.staff_list.role,
									})
									.from(auth_schema.staff_list)
									.where(
										or(
											eq(auth_schema.staff_list.auth_itm, user.id),
											eq(auth_schema.staff_list.auth_fitm, user.id)
										)
									)
									.limit(1)
									.execute();
		
								if (dbStaff[0]) {
									// role = dbStaff[0].role // Use the role from the database
									return Role.Staff; // If found, set to Staff
								} else {
									return Role.External; // If not found, set to External
								}
							} catch (error) {
								console.error("Error checking staff existence:", error);
								return Role.External; // Fallback to External on error
							}
						});
					}

					switch (user.email) {
						case "s6506022620036@email.kmutnb.ac.th":
							role = Role.Staff; // Special case for this email
							break;
						case "kolpkung01@gmail.com":
							role = Role.Student; // Special case for this email
							break;
						default:
							// No special case, use the role determined above
							break;
					}

					const data = {
						user: union(
							omit(user, ["createdAt", "updatedAt", "emailVerified"]),
							{
								role,
							}
						),
						session,
					};

					return data;
				})
			),
		],
		onAPIError: {
			throw: true,
			onError: (error) => {
				console.error("API Error:", error);
				throw error;
			},
			errorURL: `${env.FRONTEND_BASE_URL}/sign-in?error=true`,
		},
	});
}

/**
 * Type definition for the Auth object.
 * This type is derived from the return type of the `auth` function,
 * which includes user and session information along with custom session handling.
 */
export type Auth = ReturnType<typeof auth>;
