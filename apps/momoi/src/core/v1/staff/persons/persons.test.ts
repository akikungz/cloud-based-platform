import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db } from "@momoi/libs/db";
import { persons_controller } from "./persons.controller";

describe("persons_controller", () => {
  let app: typeof persons_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = persons_controller;
    api = treaty<typeof app>(app);

    // Reset database
    await db.staff_list.deleteMany();
    await db.user.deleteMany();
    // Mock user data
    await db.user.createMany({
      data: [
        { id: "test-student-id", email: "s6506022620036@email.kmutnb.ac.th", name: "Student Test" },
        { id: "test-staff-id", email: "staff.t@itm.kmutnb.ac.th", name: "Staff Test" }
      ],
      skipDuplicates: true
    });

    // Mock staff list
    await db.staff_list.create({ data: { id: 1, email: "staff.t@itm.kmutnb.ac.th" } });
  });

  it("GET /persons - should return list of persons", async () => {
    const response = await api.persons.get();

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data!.data)).toBe(true);
    expect(response.data!.data.length).toBe(1);
    expect(response.data!.data[0]).toHaveProperty("email", "staff.t@itm.kmutnb.ac.th");
  });

  // it("GET /persons/search - should return a person by email", async () => {
  //   const response = await api.persons.search.get({ query: { email: "staff.t" } });

  //   expect(response.status).toBe(200);
  //   expect(response.data).toHaveProperty("data");
  //   expect(response.data!.data).toHaveProperty("email", "staff.t@itm.kmutnb.ac.th");
  //   expect(response.data!.data).toHaveProperty("staff_id", 1);
  // });

  it("POST /persons - should create a new person", async () => {
    const response = await api.persons.post({ email: "new.person@itm.kmutnb.ac.th" });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("data");
  });

  // it("DELETE /persons - should delete a person", async () => {
  //   const response = await api.persons.delete({ email: "new.person@itm.kmutnb.ac.th" });

  //   expect(response.status).toBe(204);
  // });
});