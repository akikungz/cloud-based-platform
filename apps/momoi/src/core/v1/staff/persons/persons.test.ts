import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";
import { persons_controller } from "./persons.controller";

describe("persons_controller", () => {
  let app: typeof persons_controller;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = persons_controller;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  it("GET /persons - should return list of persons", async () => {
    const response = await api.persons.get();

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data!.data)).toBe(true);
    expect(response.data!.data.length).toBeGreaterThan(0);
    // Check that at least one person has the expected staff email
    const staffPerson = response.data!.data.find((p: any) => p.email === "staff.t@itm.kmutnb.ac.th");
    expect(staffPerson).toBeDefined();
    expect(staffPerson).toHaveProperty("staff_id", 1);
  });

  it("GET /persons/search - should return a person by email", async () => {
    const response = await api.persons.search.get({ query: { email: "staff.t@itm.kmutnb.ac.th" } });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(response.data!.data).toHaveProperty("email", "staff.t@itm.kmutnb.ac.th");
    expect(response.data!.data).toHaveProperty("staff_id", 1);
  });

  it("POST /persons - should create a new person", async () => {
    const response = await api.persons.post({ email: "new.person@itm.kmutnb.ac.th" });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("data");
  });

  it("DELETE /persons - should delete a person", async () => {
    // First create a person to delete
    await api.persons.post({ email: "delete.test@itm.kmutnb.ac.th" });
    
    const response = await api.persons.delete({ email: "delete.test@itm.kmutnb.ac.th" });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Delete a person");
  });
});