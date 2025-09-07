import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
// @ts-ignore
import { fromTypes } from "@elysiajs/openapi/gen";
import { opentelemetry } from "@elysiajs/opentelemetry";
import prometheusPlugin from "elysia-prometheus";

import { env } from "@momoi/libs/env";

import { api } from "@momoi/routes/api";
import { v1 } from "@momoi/routes/api.v1";
import { OpenAPI } from "./libs/auth";
import { logger } from "./libs/log";

export const app = new Elysia()
  .trace(({ context, onHandle }) => {
    onHandle(async ({ error, total }) => {
      if (context.route === "/metrics") return;
      logger.info({
        data: {
          route: context.route,
          method: context.request.method,
          status: context.set.status,
          total: `${total}ms`,
        }
      }, "Request handled");

      const err = await error;
      if (err) {
        logger.error({
          data: {
            route: context.route,
            method: context.request.method,
            status: context.set.status,
            total: `${total}ms`,
            error: err.message,
            stack: err.stack,
          }
        }, "Error occurred");
      }
    });
  })
  .use(opentelemetry({
    serviceName: "Momoi",
  }))
  .use(openapi({
    documentation: {
      info: {
        title: "Momoi API",
        description: "API documentation for Momoi",
        version: "1.0.0"
      },
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths(),
    },
    references: env.NODE_ENV === "development" ?
      fromTypes("src/index.ts") : undefined
  }))
  .use(
    prometheusPlugin({
      metricsPath: "/metrics",
      staticLabels: {
        service: "Momoi"
      },
    })
  )
  .use(cors({
    origin: env.TRUSTED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
  .use(api)
  .use(v1);

export type App = typeof app;

app.listen(env.BACKEND_PORT, () => console.log(`🚀 Momoi is running on port ${env.BACKEND_PORT}`));
