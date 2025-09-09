import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db } from "@momoi/libs/db";
import { createPrismaMockSetup, createPrismaTestHelpers } from "database";

import { requests_controller } from "./requests.controller";

describe("requests_controller", () => {
  let app: typeof requests_controller;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = requests_controller;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  // afterEach(resetAfterEach);

  it("GET /requests", async () => {
    const response = await api.requests.get();

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(response.data!.data).toBeDefined();
  });

  it("POST /requests", async () => {
    const response = await api.requests.post({
      type: "course",
      title: "Test Request",
      description: "This is a test request",
      hostname: "test-host",
      course_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 512,
      disk: 16,
    } as any);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.requests.length).toBe(3); // 2 from mock setup + 1 new
  });

  it("POST /requests/extend", async () => {
    const response = await api.requests.extends.post({
      instance_id: 1,
      title: "Extends Request",
      description: "This is a test extends request",
    } as any);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new extends request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.extend_requests.length).toBe(2); // 1 from mock setup + 1 new
  });
});