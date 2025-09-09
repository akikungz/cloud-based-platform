import { describe, it, expect, beforeEach } from "bun:test";
import { treaty } from "@elysiajs/eden";

import { autocomplete_controller } from "./autocomplete.controller";

import { db } from "@momoi/libs/db";

describe("autocomplete_controller", () => {
  let app: typeof autocomplete_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = autocomplete_controller;
    api = treaty<typeof app>(app);

    // Reset database (delete children before parents)
    await db.instance_request_extends.deleteMany();
    await db.instance_request.deleteMany();
    await db.instance.deleteMany();
    await db.ip_address.deleteMany();
    await db.network.deleteMany();
    await db.instance_template.deleteMany();
    await db.pve_node.deleteMany();
    await db.instance_course.deleteMany();
    await db.staff_list.deleteMany();
    await db.samester.deleteMany();
    await db.user.deleteMany();

    // Mock user data
    await db.user.createMany({
      data: [
        { id: "test-staff-id", email: "staff.t@itm.kmutnb.ac.th", name: "Staff Test" },
        { id: "test-student-id", email: "s6506022620036@email.kmutnb.ac.th", name: "Student Test" },
        { id: "test-non-staff-id", email: "non.s@itm.kmutnb.ac.th", name: "Non Staff Test" }
      ],
      skipDuplicates: true
    });

    // Mock staff list
    await db.staff_list.create({ data: { id: 1, email: "staff.t@itm.kmutnb.ac.th" } });

    // Mock instance course
    await db.instance_course.create({
      data: { id: 1, course_id: "060233101", course_title: "Introduction to Information and Network Engineering", main_staff: 1 }
    });

    // Mock PVE node
    await db.pve_node.create({ data: { id: 1, name: "Test Node", status: "online" } });

    // Mock instance template
    await db.instance_template.createMany({
      data: [
        { id: 1, os_name: "Ubuntu 20.04", vm_type: "qemu", vm_template_id: "101", vm_template_host: "Test Node" }
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