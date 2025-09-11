import { z } from "zod";

// Base schema with all required fields
const baseEnvSchema = z.object({
  // Application environment
  NODE_ENV: z.enum(["development", "production", "test"], {
    message: "NODE_ENV must be one of development, production, or test",
  }).default("development"),
  // Logging level
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"], {
      message: "LOG_LEVEL must be one of debug, info, warn, or error",
    })
    .default("info"),
  // Logging target
  LOG_TARGET: z
    .enum(["console", "file", "loki"], {
      message: "LOG_TARGET must be one of console, file, or loki",
    })
    .default("console"),
  // Loki logging URL
  LOKI_URL: z
    .url({
      message: "LOKI_URL must be a valid URL",
    })
    .optional(),
  // OpenTelemetry Collector URL
  OTEL_COLLECTOR_URL: z
    .url({
      message: "OTEL_COLLECTOR_URL must be a valid URL",
    })
    .default("http://localhost:4317"),
  // OpenTelemetry service names
  OTEL_SERVICE_NAME: z
    .string()
    .min(1, {
      message: "OTEL_SERVICE_NAME is required",
    })
    .default("Momoi"),

  // Database connection URL
  DATABASE_URL: z.url({
    message: "DATABASE_URL must be a valid URL",
  }),
  // RabbitMQ configuration
  RABBITMQ_URL: z
    .url({
      message: "RABBITMQ_URL must be a valid URL",
    })
    .default("amqp://guest:guest@localhost:5672"),
  RABBITMQ_EXCHANGE: z
    .string()
    .min(1, {
      message: "RABBITMQ_EXCHANGE is required",
    })
    .default("yuzu.exchange"),
  RABBITMQ_QUEUE: z
    .string()
    .min(1, {
      message: "RABBITMQ_QUEUE is required",
    })
    .default("yuzu.queue"),
  RABBITMQ_ROUTING_KEY: z
    .string()
    .min(1, {
      message: "RABBITMQ_ROUTING_KEY is required",
    })
    .default("yuzu.create"),
  // CORS trusted origins
  TRUSTED_ORIGINS: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.split(",").map((origin) => origin.trim());
      }
      return val;
    },
    z.array(z.url()).nonempty({
      message: "TRUSTED_ORIGINS must be a non-empty array of valid URLs",
    }),
  ),
  // Google OAuth configuration
  GOOGLE_CLIENT_ID: z.string().min(1, {
    message: "GOOGLE_CLIENT_ID is required",
  }),
  GOOGLE_CLIENT_SECRET: z.string().min(1, {
    message: "GOOGLE_CLIENT_SECRET is required",
  }),
  // Port for the application to listen on
  PORT: z.preprocess((val) => {
    const port = parseInt(val as string, 10);
    return Number.isNaN(port) ? 3000 : port;
  }, z.number().int().positive().default(3001)),

  // Base URL for the backend and frontend
  API_URL: z
    .url({
      message: "API_URL must be a valid URL",
    })
    .default("http://localhost:3001"),
  FRONTEND_BASE_URL: z
    .url({
      message: "FRONTEND_BASE_URL must be a valid URL",
    })
    .default("http://localhost:3000"),
});

// Test schema with all fields optional
const testEnvSchema = z.object({
  // Application environment
  NODE_ENV: z.enum(["development", "production", "test"], {
    message: "NODE_ENV must be one of development, production, or test",
  }).optional(),
});

// Conditional schema based on NODE_ENV
const envSchema = process.env.NODE_ENV === "test"
  ? testEnvSchema
  : baseEnvSchema;

const parseEnv = envSchema.safeParse(process.env);
if (!parseEnv.success) {
  process.exit(1);
}

export const env = parseEnv.data as z.infer<typeof baseEnvSchema>; // Because test schema is optional
export type EnvVariables = z.infer<typeof envSchema>;

export default env;
