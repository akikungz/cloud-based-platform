import { env } from "@yuzu/libs/env";
import { http_instance, replace_params } from "@yuzu/libs/http";
import type {
	PVE_API,
	PVE_PATH,
	PVE_RequestBody,
	PVE_RequestParams,
	PVE_RequestResponse,
} from "@yuzu/libs/pve/types";

import { AxiosError } from "axios";
import { ErrorHandler, PVEAPIError, ErrorContext } from "@yuzu/libs/errors";

export const pve_instance = http_instance.create({
	baseURL: env.PVE_API_URL,
	headers: {
		Authorization: `PVEAPIToken=${env.PVE_API_TOKEN_USER}!${env.PVE_API_TOKEN_NAME}=${env.PVE_API_TOKEN}`,
	},
});

pve_instance.interceptors.response.use(
	(response) => {
		// Skip logging for task status requests to reduce noise
		if(response.config.url?.includes("tasks")) return Promise.resolve(response);

		console.info(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: "info",
				message: "PVE API request",
				data: {
					url: response.config.url,
					method: response.config.method,
					status: response.status,
					bytes: response.headers["content-length"]
						? parseInt(response.headers["content-length"])
						: -1,
				},
			}),
		);

		return Promise.resolve(response);
	},
	(error) => {
		// Enhanced error logging with context
		const context: Partial<ErrorContext> = {
			operation: 'pve_api_request',
			node: extractNodeFromUrl(error.config?.url),
			timestamp: new Date(),
			additional: {
				url: error.config?.url,
				method: error.config?.method,
				status: error.response?.status,
				statusText: error.response?.statusText
			}
		};

		// Convert to YuzuError and log
		const yuzuError = ErrorHandler.fromAxiosError(error, context);
		ErrorHandler.logError(ErrorHandler.createErrorInfo(yuzuError, context));

		return Promise.reject(yuzuError);
	},
);

/**
 * Extracts node name from PVE API URL
 */
function extractNodeFromUrl(url?: string): string | undefined {
	if (!url) return undefined;
	const match = url.match(/\/nodes\/([^\/]+)/);
	return match ? match[1] : undefined;
}

export interface InstanceArgs<
	Path extends PVE_PATH,
	Method extends keyof PVE_API<Path>,
> {
	path: Path;
	method: Method;
	params: PVE_RequestParams<Path, Method>;
	body?: PVE_RequestBody<Path, Method>;
}

export interface InstanceReturn<T> {
	status: number;
	data: T;
}

export interface ErrorResponse {
	data: null;
	message: string;
}

export const instance = async <
	Path extends PVE_PATH,
	Method extends keyof PVE_API<Path>,
	Response extends PVE_RequestResponse<Path, Method> = PVE_RequestResponse<
		Path,
		Method
	>,
>({
	path,
	method,
	params,
	body,
}: InstanceArgs<Path, Method>): Promise<InstanceReturn<Response>> => {
	// biome-ignore lint/suspicious/noExplicitAny: <any> is used to allow flexibility in request body and response types
	const pre_path = replace_params(path, params as any);

	const context: Partial<ErrorContext> = {
		operation: `pve_${String(method).toLowerCase()}`,
		node: (params as any)?.node,
		vmid: (params as any)?.vmid,
		timestamp: new Date(),
		additional: {
			path,
			pre_path,
			params,
			body
		}
	};

	try {
		const request = await pve_instance<Response>({
			url: pre_path,
			method: method as string,
			data: body,
		});

		return { status: request.status, data: request.data };
	} catch (error) {
		// Error is already converted to YuzuError by the interceptor
		// Just re-throw it with additional context
		if (error instanceof PVEAPIError) {
			throw error;
		}
		
		// Fallback for any other errors
		throw ErrorHandler.handleError(error, context);
	}
};
