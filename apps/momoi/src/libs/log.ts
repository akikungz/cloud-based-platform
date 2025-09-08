import pino, { transport } from "pino";
import type { LokiOptions } from "pino-loki";

import { env } from "@momoi/libs/env";

// In test environment, use simple console logging
export const init_transport = (env.NODE_ENV === "test" || !env.NODE_ENV)
  ? undefined // Use default console transport
  : env.LOG_TARGET === "loki"
  ? transport<LokiOptions>({
    target: "pino-loki",
    options: {
      host: env.LOKI_URL || "http://localhost:3100",
      labels: {
        app: "Momoi",
      },
      batching: true,
      interval: 5,
      timeout: 30,
    },
  })
  : transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  });

export const logger = pino(init_transport);
