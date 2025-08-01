import { app } from "@momoi/index";

import { env } from "@momoi/libs/env";

app.trace(({ context, onHandle }) => {
	onHandle(async ({ error, total }) => {
		console.log(
			`Request ${context.request.method} ${context.route} ${context.request.url} handled in ${total}ms`,
		);
		if (error) {
			const opt = await error;
			if (opt) {
				console.error(
					`Error in request ${context.request.method} ${context.route} ${context.request.url}:`,
					opt,
				);
			}
		}
	});
});

app.listen(env.BACKEND_PORT, (ctx) => {
	console.log(`🦊 Elysia is running at ${ctx.hostname}:${ctx.port}`);
});
