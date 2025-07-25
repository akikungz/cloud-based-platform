import { z } from "zod";

const envSchema = z.object({
	// Application environment
	NODE_ENV: z.enum(["development", "production", "test"], {
		message: "NODE_ENV must be one of development, production, or test",
	}),
	// Logging level
	LOG_LEVEL: z
		.enum(["debug", "info", "warn", "error"], {
			message: "LOG_LEVEL must be one of debug, info, warn, or error",
		})
		.default("info"),
	// OpenTelemetry Collector URL
	OTEL_COLLECTOR_URL: z
		.string()
		.url({
			message: "OTEL_COLLECTOR_URL must be a valid URL",
		})
		.default("http://localhost:4317"),
	// OpenTelemetry service names
	OTEL_BACKEND_SERVICE_NAME: z
		.string()
		.min(1, {
			message: "OTEL_BACKEND_SERVICE_NAME is required",
		})
		.default("Momoi"),

	// Database connection URL
	DATABASE_URL: z.url({
		message: "DATABASE_URL must be a valid URL",
	}),
	// RabbitMQ configuration
	RABBITMQ_URI: z
		.string()
		.url({
			message: "RABBITMQ_URI must be a valid URL",
		})
		.default("amqp://guest:guest@localhost:5672"),
	RABBITMQ_QUEUE_NAME: z
		.string()
		.min(1, {
			message: "RABBITMQ_QUEUE_NAME is required",
		})
		.default("task-queue"),
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
	BACKEND_PORT: z.preprocess((val) => {
		const port = parseInt(val as string, 10);
		return Number.isNaN(port) ? 3000 : port;
	}, z.number().int().positive().default(3000)),

	// Base URL for the backend and frontend
	BACKEND_API_URL: z
		.url({
			message: "BACKEND_API_URL must be a valid URL",
		})
		.default("http://localhost:3000"),
	FRONTEND_BASE_URL: z
		.url({
			message: "FRONTEND_BASE_URL must be a valid URL",
		})
		.default("http://localhost:3001"),
});

const parseEnv = envSchema.safeParse(process.env);
if (!parseEnv.success) {
	console.error("Invalid environment variables:", parseEnv.error.message);
	process.exit(1);
}

export const env = parseEnv.data;
export type EnvVariables = z.infer<typeof envSchema>;

export default env;
