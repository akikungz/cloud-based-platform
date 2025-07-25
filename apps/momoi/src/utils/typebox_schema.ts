import { t } from "elysia";

export const paginationSchema = {
	page: t.Integer({ minimum: 1, default: 1, description: "Page number" }),
	limit: t.Integer({
		minimum: 1,
		maximum: 100,
		default: 10,
		description: "Number of items per page",
	}),
};
