import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, openAPI } from "better-auth/plugins";
import { auth_schema, better_auth, db, drizzle } from "db";
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

export const auth = (env: AuthEnv) =>
	betterAuth({
		database: drizzleAdapter(db(env.DATABASE_URL), {
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
						const dbStaff = await db(env.DATABASE_URL)
							.select({
								id: auth_schema.staff_list.id,
								auth: auth_schema.staff_list.auth_id,
							})
							.from(auth_schema.staff_list)
							.where(drizzle.eq(auth_schema.staff_list.auth_id, user.id))
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

				// if (user.email == "s6506022620036@email.kmutnb.ac.th") {
				// 	role = Role.Staff; // Special case for this email
				// }

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
	});

export type Auth = ReturnType<typeof auth>;
