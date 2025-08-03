import { authModule } from "@momoi/modules/auth";
import { samester_management } from "@momoi/modules/samester";
import { Elysia, t } from "elysia";

export const test_api = new Elysia({ prefix: "/test" })
  .use(authModule)
  .guard({ auth: true })
  .get("/samester", async ({ status }) => {
    try {
      const samesters = await samester_management.getAllSamesters();
      return status(200, samesters);
    } catch (_error) {
      return status(500, { message: "Failed to fetch samesters" });
    }
  }, {
    response: {
      200: t.Array(t.Object({
        id: t.String(),
        name: t.String(),
        start_at: t.Date(),
        end_at: t.Date(),
      })),
      500: t.Object({
        message: t.String(),
      }),
    }
  })
  .post("/samester", async ({ body, status }) => {
    try {
      const samester = await samester_management.createSamester(body);
      return status(201, samester);
    } catch (_error) {
      return status(500, { message: "Failed to create samester" });
    }
  }, {
    body: t.Object({
      name: t.String(),
      start_at: t.Date(),
      end_at: t.Date(),
    }),
    response: {
      201: t.Object({
        id: t.String(),
        name: t.String(),
        start_at: t.Date(),
        end_at: t.Date(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    }
  });