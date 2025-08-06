import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, openAPI } from "better-auth/plugins";
import { auth_schema, better_auth, db as _db } from "db";
import { eq } from "drizzle-orm";
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
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: {
				account: better_auth.account,
				session: better_auth.session,
				user: better_auth.user,
				verification: better_auth.verification,
			},
		}),
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
			customSession(async ({ user, session }) => {
				let role = getRoleFromEmail(user.email);

				if (role === Role.Staff) {
					// Check is staff exists in the database
					try {
						const dbStaff = await db
							.select({
								id: auth_schema.staff_list.id,
								auth: auth_schema.staff_list.auth_id,
							})
							.from(auth_schema.staff_list)
							.where(eq(auth_schema.staff_list.auth_id, user.id))
							.limit(1)
							.execute();
						
						if (dbStaff.length === 0) {
							role = Role.External; // If not found, set to External
						}
					} catch (error) {
						console.error("Error checking staff existence:", error);
						role = Role.External; // Fallback to External on error
					}
				}

				switch (user.email) {
					case "s6506022620036@email.kmutnb.ac.th":
						role = Role.Staff; // Special case for this email
						break;
					case "kolpkung01@gmail.com":
						role = Role.Student;
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
			}),
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
