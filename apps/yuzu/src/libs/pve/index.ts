import { env } from "@yuzu/libs/env";
import { http_instance } from "@yuzu/libs/http";
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
	(response) => response.data,
	(error) => {
		console.error("PVE API error:", error);
		return Promise.reject(error);
	},
);

export const requestPVE = async <
	Path extends PVE_PATH,
	Method extends keyof PVE_API<Path>,
	Params extends PVE_RequestParams<Path, Method> = PVE_RequestParams<
		Path,
		Method
	>,
	Body extends PVE_RequestBody<Path, Method> = PVE_RequestBody<Path, Method>,
	Response extends PVE_RequestResponse<Path, Method> = PVE_RequestResponse<
		Path,
		Method
	>,
>({
	path,
	method,
	params,
	body,
}: {
	path: Path;
	method: Method;
	params?: Params;
	body?: Body;
}): Promise<Response> => {
	const request = await pve_instance.request<Response>({
		url: path,
		method: method as string,
		params,
		data: body,
	});

	if (request.status !== 200) {
		throw new Error(`PVE API request failed with status ${request.status}`);
	}

	return request.data;
};
