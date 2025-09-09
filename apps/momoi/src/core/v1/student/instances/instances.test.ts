import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db } from "@momoi/libs/db";
import { createPrismaMockSetup, createPrismaTestHelpers } from "database";

import { instances_controller } from "./instances.controller";

describe("instances_controller", () => {
  let app: typeof instances_controller;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = instances_controller;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  it("GET / should return list of instances", async () => {
    const response = await api.instances.get();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.data).toBeInstanceOf(Array);
    expect(response.data!.data.length).toBeGreaterThan(0);
  });

  it("GET /1 should return instance detail", async () => {
    const response = await api.instances({ id: 1 }).get();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.data).toHaveProperty("id", 1);
  });

  it("DELETE /1 should delete instance", async () => {
    const response = await api.instances({ id: 1 }).delete();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.message).toBe("Instance deleted successfully");
  });
});