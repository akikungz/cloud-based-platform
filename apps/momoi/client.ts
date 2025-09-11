import { treaty } from "@elysiajs/eden";

import { app, type App } from "./src/app";

export const client = (url: string) => treaty<App>(url, {
  fetch: {
    credentials: "include",
  }
});

export type Client = ReturnType<typeof client>;

export const server = app;
export type Server = App;
