import { env } from "@yuzu/libs/env";
import { http_instance, replace_params } from "@yuzu/libs/http";
import type {
	PVE_API,
	PVE_PATH,
	PVE_RequestBody,
	PVE_RequestParams,
	PVE_RequestResponse,
} from "@yuzu/libs/pve/types";

export const pve_instance = http_instance.create({
	baseURL: env.PVE_API_URL,
	headers: {
		Authorization: `PVEAPIToken=${env.PVE_API_TOKEN_USER}!${env.PVE_API_TOKEN_NAME}=${env.PVE_API_TOKEN}`,
	},
});

pve_instance.interceptors.response.use(
	(response) => {
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

		return response;
	},
	(error) => {
		console.error("PVE API error:", error);
		return Promise.reject(error);
	},
);

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

	const request = await pve_instance<Response>({
		url: pre_path,
		method: method as string,
		data: body,
	});

	return { status: request.status, data: request.data };
};
