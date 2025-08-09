import { app } from "@momoi/index";

import { env } from "@momoi/libs/env";

app.trace(({ context, onHandle }) => {
	onHandle(async ({ error, total }) => {
		console.info(
			JSON.stringify({
				timestamp: new Date().toISOString(),
				level: "info",
				message: "Request handled",
				data: {
					route: context.route,
					method: context.request.method,
					status: context.status,
					totalTime: `${total} ms`,
				},
			})
		);

		if (error) {
			const opt = await error;
			if (opt) {
				console.error(
					JSON.stringify({
						timestamp: new Date().toISOString(),
						level: "error",
						message: "Error occurred",
						data: {
							route: context.route,
							method: context.request.method,
							status: context.status,
							error: opt.message,
						},
					})
				);
			}
		}
	});
});

app.listen(env.BACKEND_PORT, (ctx) => {
	console.log(`🦊 Elysia is running at ${ctx.hostname}:${ctx.port}`);
});
