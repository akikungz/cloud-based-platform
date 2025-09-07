import { Elysia } from "elysia";
import { record } from "@elysiajs/opentelemetry";

import { auth } from "@momoi/libs/auth";
import { logger } from "@momoi/libs/log";

import { Role } from "auth/utils/role";
import { pick } from "utils/functions/objects";

export const auth_service = new Elysia({ name: "auth.service" })
  .macro({
    auth: {
      resolve: async ({ status, request: { headers } }) => {
        const result = await record("auth.resolve", () =>
          auth.api.getSession({ headers })
        );

        if (!result) {
          logger.info("No session found");
          return status(401, { message: "Unauthorized" });
        }

        const { user, session } = result;
        if (!session) {
          logger.info("No session found");
          return status(401, { message: "Unauthorized" });
        } else {
          if (session.expiresAt < new Date()) {
            logger.info("Session expired");
            return status(401, { message: "Unauthorized" });
          }
        }

        if (!user) {
          logger.info("No user found");
          return status(401, { message: "Unauthorized" });
        }

        return {
          user: pick(user, ["id", "email", "role", "image"]),
          session: pick(session, ["id", "userId", "expiresAt"]),
          isStaff: user.role === Role.Staff
        };
      }
    },
  });
