import { Elysia } from "elysia";

export const logger = new Elysia({ name: "logger" })
  .onAfterResponse((ctx) => {
    console.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Request handled",
        data: {
          route: ctx.route,
          method: ctx.request.method,
          status: ctx.status,
          bytes: ctx.response && typeof ctx.response === 'object' && 'headers' in ctx.response 
            ? (ctx.response as Response).headers.get("content-length")
            : -1,
        }
      })
    )
  })