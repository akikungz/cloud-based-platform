import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, openAPI } from "better-auth/plugins";
import { record } from "@elysiajs/opentelemetry"

import type { PrismaDB } from "database";
import { check_staff } from "database/functions/auth/staff";
import { is_staff, is_student, role_validator } from "./utils/role";

const return_null = {
  user: undefined,
  session: undefined
}

/** Authentication environment variables */
export interface AuthEnv {
  base_url: string,
  base_path: string,
  frontend_url: string,
  social_providers: {
    google: {
      client_id: string,
      client_secret: string
    },
  },
  trusted_origins: string[],
}

/**
 * Create an authentication instance.
 * @param db Database connection
 * @param env Authentication environment variables
 * @returns A better-auth instance
 */
export const auth = (db: PrismaDB, env: AuthEnv) => betterAuth({
  database: record(
    "auth.database",
    () => prismaAdapter(db, { provider: "postgresql" })
  ),
  baseUrl: env.base_url,
  basePath: env.base_path,
  trustedOrigins: env.trusted_origins,
  socialProviders: {
    google: {
      clientId: env.social_providers.google.client_id,
      clientSecret: env.social_providers.google.client_secret,
      redirectURI: `${env.base_url}/auth/callback/google`,
      prompt: "select_account",
      scope: ["profile", "email"],
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    customSession(({ user, session }) => record(
      "auth.custom_session",
      async () => {
        const role = role_validator(user.email!);

        if (is_staff(role)) {
          const response = await record(
            "auth.staff_validation",
            async () => {
              const isStaff = await check_staff(db, user.id);
              if (!isStaff) return return_null;

              return { user: { ...user, role }, session }
            }
          )

          return response;
        }

        if (is_student(role)) {
          return {
            user: {
              ...user,
              role
            },
            session
          }
        }

        return return_null;
      }
    )),
    openAPI()
  ]
});

/** Authentication instance type */
export type AuthServer = ReturnType<typeof auth>;