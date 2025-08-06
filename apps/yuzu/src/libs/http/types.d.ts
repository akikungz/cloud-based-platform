/** biome-ignore-all lint/complexity/noBannedTypes: Record type is needed for flexible API request/response types */
/** biome-ignore-all lint/suspicious/noExplicitAny: <any> is used to allow flexibility in request body and response types */
/** biome-ignore-all lint/correctness/noUnusedVariables: This is used to extract dynamic route parameters from a string */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOptions<
	Path extends string,
	Params extends ExtractParams<Path> = ExtractParams<Path>,
	Body extends Record<string, any> = {},
	Response extends Record<string, any> = {},
> = {
	method: HttpMethod;
	params?: ExtractParams<Path>;
	body?: Body;
	response: Response;
};

export type ExtractParams<T extends string> =
	T extends `${infer PartA}/:${infer Param}/${infer Next}`
		? Record<Param, any> & ExtractParams<`/${Next}`>
		: T extends `${infer PartA}/:${infer Param}`
			? Record<Param, any>
			: {};

const test: RequestOptions<
	"/users/:id/posts/:postId",
	{
		id: string;
		postId: string;
	},
	{ title: string },
	{ id: string; title: string }
> = {
	method: "GET",
	params: { id: "123", postId: "456" },
	body: { title: "Hello World" },
	response: { id: "123", title: "Hello World" },
};
