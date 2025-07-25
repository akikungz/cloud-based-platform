import { opentelemetry } from "@elysiajs/opentelemetry";
import swagger from "@elysiajs/swagger";
import { api } from "@momoi/api";
import { env } from "@momoi/libs/env";
import { OpenAPI } from "@momoi/modules/auth";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Elysia, redirect } from "elysia";
import { dts } from "elysia-remote-dts";

export const app = new Elysia()
	.use(
		opentelemetry({
			spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({}))],
			serviceName: "Momoi",
		}),
	)
	.use(
		swagger({
			documentation: {
				info: {
					title: "Momoi API",
					description: "API documentation for Momoi",
					version: "1.0.0",
				},
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
			path: "/docs",
		}),
	)
	.use(dts("./src/index.ts"))
	.get("/", () => redirect(env.FRONTEND_BASE_URL), {
		detail: {
			description: "Redirect to frontend base URL",
		},
	})
	.use(api);

export type App = typeof app;
