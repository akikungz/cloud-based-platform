import { auto_complete } from "@momoi/modules/auto_complete";
import { Elysia, t } from "elysia";

export const auto_complete_api = new Elysia({ prefix: "/auto_complete" })
  .get("/courses", async ({ status }) => {
    try {
      const courses = await auto_complete.getCourses();
      return status(200, courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      return status(500, {
        message: "Failed to fetch courses",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    schema: {
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            course_id: t.String(),
            course_title: t.String()
          })
        )
      }
    }
  })
  .get("/staff", async ({ status }) => {
    try {
      const staffList = await auto_complete.getStaffList();
      return status(200, staffList);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      return status(500, {
        message: "Failed to fetch staff list",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    schema: {
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String()
          })
        )
      }
    }
  })
  .get("/templates", async ({ status }) => {
    try {
      const templates = await auto_complete.getTemplates();
      return status(200, templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return status(500, {
        message: "Failed to fetch templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }, {
    schema: {
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            os_name: t.String()
          })
        ),
        500: t.Object({
          message: t.String(),
          error: t.String()
        })
      }
    }
  });