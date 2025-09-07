import { Elysia } from "elysia";
import { record } from "@elysiajs/opentelemetry";

import { auth } from "@momoi/libs/auth";
import { logger } from "@momoi/libs/log";

import { Role } from "auth/utils/role";
import { pick } from "utils/functions/objects";

export const auth_service = new Elysia({ name: "auth.service" })
  .macro({
    auth: {
      resolve: async (ctx) => {
        const result = await record("auth.resolve", () =>
          auth.api.getSession({ headers: ctx.request.headers })
        );

        if (!result) {
          logger.info({
            route: ctx.route,
            method: ctx.request.method,
            status: ctx.set.status,
          }, "No session found");
          return ctx.status(401, { message: "Unauthorized" });
        }

        const { user, session } = result;
        if (!session) {
          logger.info({
            route: ctx.route,
            method: ctx.request.method,
            status: ctx.set.status
          }, "No session found");
          return ctx.status(401, { message: "Unauthorized" });
        } else {
          if (session.expiresAt < new Date()) {
            logger.info({
              route: ctx.route,
              method: ctx.request.method,
              status: ctx.set.status
            }, "Session expired");
            return ctx.status(401, { message: "Unauthorized" });
          }
        }

        if (!user) {
          logger.info({
            route: ctx.route,
            method: ctx.request.method,
            status: ctx.set.status
          });
          return ctx.status(401, { message: "Unauthorized" });
        }

        return {
          user: pick(user, ["id", "email", "role", "image"]),
          session: pick(session, ["id", "userId", "expiresAt"]),
          isStaff: user.role === Role.Staff
        };
      }
    },
  });
