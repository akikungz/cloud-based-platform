import { treaty } from "@elysiajs/eden";

import type { App } from "@momoi/index";

export const client = (url: string) => treaty<App>(url);

export type Client = ReturnType<typeof client>;
