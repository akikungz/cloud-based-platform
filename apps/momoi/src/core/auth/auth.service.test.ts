import { describe, it, expect, beforeEach } from "bun:test";

import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";

import { Role } from "auth/utils/role";

import { mockAuthStudent, mockAuthStaff, mockAuthNoUser } from "./auth.service-test";

const mockAuthStaffTest = new Elysia()
  .use(mockAuthStaff)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/protected", ({ user, status }) => {
    return status(200, { message: "Protected content", data: user });
  })
  .get("/student-only", ({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
    return status(200, { message: "Student content" });
  });

describe("mockAuthStaff", () => {
  let app: typeof mockAuthStaffTest;
  let api: ReturnType<typeof treaty<typeof mockAuthStaffTest>>;

  beforeEach(() => {
    app = mockAuthStaffTest;
    api = treaty<typeof app>(app);
  });

  it("should allow access to staff user", async () => {
    const response = await api.protected.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Protected content",
      data: {
        id: "test-staff-id",
        email: "staff.t@itm.kmutnb.ac.th",
        role: Role.Staff,
        image: null
      }
    });
  });

  it("should deny access to student-only route for staff user", async () => {
    const response = await api["student-only"].get();
    expect(response.status).toBe(403);
    expect(response.data).toEqual(null);
  });
});

const mockAuthStudentTest = new Elysia()
  .use(mockAuthStudent)
  .guard({ auth: true })
  .onBeforeHandle(({ isStaff, status }) => {
    if (isStaff) return status(403, { message: "Forbidden" });
  })
  .get("/protected", ({ user, status }) => {
    return status(200, { message: "Protected content", data: user });
  })
  .get("/staff-only", ({ isStaff, status }) => {
    if (!isStaff) return status(403, { message: "Forbidden" });
    return status(200, { message: "Staff content" });
  });

describe("mockAuthStudent", () => {
  let app: typeof mockAuthStudentTest;
  let api: ReturnType<typeof treaty<typeof mockAuthStudentTest>>;

  beforeEach(() => {
    app = mockAuthStudentTest;

    api = treaty<typeof app>(app);
  });

  it("should allow access to student user", async () => {
    const response = await api.protected.get();
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Protected content",
      data: {
        id: "test-student-id",
        email: "s6506022620036@email.kmutnb.ac.th",
        role: Role.Student,
        image: null
      }
    });
  });

  it("should deny access to staff-only route for student user", async () => {
    const response = await api["staff-only"].get();
    expect(response.status).toBe(403);
    expect(response.data).toEqual(null);
  });
});

const mockAuthNoUserTest = new Elysia()
  .use(mockAuthNoUser)
  .guard({ auth: true })
  .onBeforeHandle(({ status }) => {
    return status(401, { message: "Unauthorized" });
  })
  .get("/protected", ({ status }) => {
    return status(200, { message: "Protected content", data: null });
  });

describe("mockAuthNoUser", () => {
  let app: typeof mockAuthNoUserTest;
  let api: ReturnType<typeof treaty<typeof mockAuthNoUserTest>>;

  beforeEach(() => {
    app = mockAuthNoUserTest;

    api = treaty<typeof app>(app);
  });

  it("should deny access when no user is authenticated", async () => {
    const response = await api.protected.get();

    expect(response.status).toBe(401);
    expect(response.data).toEqual(null);
  });
});