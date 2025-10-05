import { cors } from "@elysiajs/cors";
import { openapi, fromTypes } from "@elysiajs/openapi";
// // @ts-ignore
// import { fromTypes } from "@elysiajs/openapi/gen";
import { opentelemetry } from "@elysiajs/opentelemetry";
import prometheusPlugin from "elysia-prometheus";

import { env } from "@momoi/libs/env";
import { app } from "@momoi/app";

import { OpenAPI } from "@momoi/libs/auth";
import { logger } from "@momoi/libs/log";

app.trace(({ context, onHandle }) => {
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
});

app.use(
  prometheusPlugin({
    metricsPath: "/metrics",
    staticLabels: {
      service: "Momoi"
    },
  })
);

app.use(opentelemetry({
  serviceName: "Momoi",
}));

app.use(openapi({
  documentation: {
    info: {
      title: "Momoi API",
      description: "API documentation for Momoi",
      version: "1.0.0",
    },
    components: await OpenAPI.components,
    paths: await OpenAPI.getPaths(),
    servers: [
      { url: env.FRONTEND_BASE_URL, description: "Frontend proxy" },
      { url: env.API_URL, description: "Development server" },
    ]
  },
  references: env.NODE_ENV === "development" ?
    fromTypes("src/app.ts") : undefined
}))

app.use(cors({
  origin: env.TRUSTED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))

app.listen(env.PORT, () => console.log(`😺 Momoi is running on port ${env.PORT}`));
