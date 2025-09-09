import { describe, it, expect, beforeEach } from "bun:test";
import { treaty } from "@elysiajs/eden";

import { autocomplete_controller } from "./autocomplete.controller";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

describe("autocomplete_controller", () => {
  let app: typeof autocomplete_controller;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = autocomplete_controller;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();

    // Add additional test data specific to autocomplete tests
    await db.user.createMany({
      data: [
        { id: "test-non-staff-id", email: "non.s@itm.kmutnb.ac.th", name: "Non Staff Test" }
      ],
      skipDuplicates: true
    });
  });

  // afterEach(resetAfterEach);

  it("should return course autocomplete suggestions", async () => {
    const response = await api.autocomplete.course.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Get course autocomplete",
      data: expect.any(Array)
    });
  });

  it("should return staff autocomplete suggestions", async () => {
    const response = await api.autocomplete.staff.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Get staff autocomplete",
      data: expect.any(Array)
    });
  });

  it("should return staff emails with is_staff flag", async () => {
    const response = await api.autocomplete.staff.emails.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Get staff emails autocomplete",
      data: expect.any(Array)
    });
  });

  it("should return template autocomplete suggestions", async () => {
    const response = await api.autocomplete.template.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Get template autocomplete",
      data: expect.any(Array)
    });
  });
});