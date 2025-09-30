import { Elysia, t } from "elysia";

import { env } from "@momoi/libs/env";
import { auth_service } from "@momoi/core/auth/auth.service";
import { mockAuthStaff } from "@momoi/core/auth/auth.service-test";
import { CourseService } from "./course.service";

import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { warpper } from "@akikungz/warpper-ts";

export const CourseController = new Elysia({
  name: "staff.course.controller",
  prefix: "/course",
  detail: {
    tags: ["Course", "Staff"],
    description: "Staff course related endpoints"
  }
})
  .use(env.NODE_ENV === "test" ? mockAuthStaff : auth_service)
  .guard({ auth: true })
  .onBeforeHandle(async ({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/", async ({ status, query }) => {
    const [err, courses] = await warpper(CourseService.getCourses, [query?.skip, query?.take]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Courses fetched successfully",
      data: courses
    });
  }, {
    query: t.Optional(t.Object({
      skip: t.Optional(t.Number()),
      take: t.Optional(t.Number())
    }))
  })
  .get("/search", async ({ status, query }) => {
    if (!query?.q) {
      return status(400, { message: "Search query 'q' is required" });
    }

    const [err, courses] = await warpper(CourseService.searchCourses, [query.q!, query?.skip, query?.take]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Courses searched successfully",
      data: courses
    });
  }, {
    query: t.Optional(t.Object({
      q: t.String({ minLength: 1 }),
      skip: t.Optional(t.Number()),
      take: t.Optional(t.Number())
    }))
  })
  .get("/my-courses", async ({ status, user }) => {
    const staff_id = 'staff_id' in user ? user.staff_id : undefined;
    if (!staff_id) return status(403, { message: "Forbidden" });
    const [err, courses] = await warpper(CourseService.getCoursesByStaff, [staff_id]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Courses fetched for current staff successfully",
      data: courses
    });
  })
  .get("/staff/:staffId", async ({ status, params }) => {
    const [err, courses] = await warpper(CourseService.getCoursesByStaff, [params.staffId]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Courses fetched for staff successfully",
      data: courses
    });
  }, {
    params: t.Object({
      staffId: t.Number()
    })
  })
  .get("/course-id/:courseId", async ({ status, params }) => {
    const [err, course] = await warpper(CourseService.getCourseByCourseId, [params.courseId]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Course fetched successfully",
      data: course
    });
  }, {
    params: t.Object({
      courseId: t.String()
    })
  })
  .get("/:id/stats", async ({ status, params }) => {
    const [err, stats] = await warpper(CourseService.getCourseStats, [params.id]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Course statistics fetched successfully",
      data: stats
    });
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .get("/:id", async ({ status, params }) => {
    const [err, course] = await warpper(CourseService.getCourseById, [params.id]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Course fetched successfully",
      data: course
    });
  }, {
    params: t.Object({
      id: t.Number()
    })
  })
  .post("/", async ({ status, body }) => {
    const [err, course] = await warpper(CourseService.createCourse, [body]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(201, {
      message: "Course created successfully",
      data: course
    });
  }, {
    body: t.Object({
      course_id: t.String({ minLength: 1 }),
      course_title: t.String({ minLength: 1 }),
      main_staff: t.Number(),
      assistant_staff_1: t.Optional(t.Number()),
      assistant_staff_2: t.Optional(t.Number()),
      assistant_staff_3: t.Optional(t.Number())
    })
  })
  .put("/:id", async ({ status, params, body }) => {
    const [err, course] = await warpper(CourseService.updateCourse, [params.id, body]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Course updated successfully",
      data: course
    });
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      course_id: t.Optional(t.String({ minLength: 1 })),
      course_title: t.Optional(t.String({ minLength: 1 })),
      main_staff: t.Optional(t.Number()),
      assistant_staff_1: t.Optional(t.Number()),
      assistant_staff_2: t.Optional(t.Number()),
      assistant_staff_3: t.Optional(t.Number())
    })
  })
  .delete("/:id", async ({ status, params }) => {
    const [err, deletedCourse] = await warpper(CourseService.deleteCourse, [params.id]);

    if (err) {
      return status(500, { message: err.message });
    }

    return status(200, {
      message: "Course deleted successfully",
      data: deletedCourse
    });
  }, {
    params: t.Object({
      id: t.Number()
    })
  });
