import { Agent } from "node:https";
import axios from "axios";

import type { ExtractParams } from "./types";

export const http_instance = axios.create({
	httpsAgent: new Agent({
		rejectUnauthorized: false,
	}),
});

export const replace_params = <
	Path extends string,
	Params extends ExtractParams<Path>,
>(
	path: Path,
	params: Params
): string => {
	let replacedPath: string = path;
	Object.entries(params).forEach(([key, value]) => {
		const paramPattern = new RegExp(`:${key}`, "g");
		replacedPath = replacedPath.replace(paramPattern, String(value));
	});

	return replacedPath;
};
