import { app } from "@momoi/index";

import { env } from "@momoi/libs/env";

app.listen(env.BACKEND_PORT, (ctx) => {
	console.log(`🦊 Elysia is running at ${ctx.hostname}:${ctx.port}`);
});
