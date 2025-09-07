import { describe, it, expect, beforeEach } from "bun:test";
import { treaty } from "@elysiajs/eden";

import { autocomplete_controller } from "./autocomplete.controller";

import { mock_db } from "database";
import { resetAll } from "database/functions/test/reset";
import { instance_course, instance_template, pve_node } from "database/schema/core/instances";
import { staff_list } from "database/schema/auth/user";
import { user } from "database/schema/auth/better-auth";

describe("autocomplete_controller", () => {
  let app: typeof autocomplete_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = autocomplete_controller;
    api = treaty<typeof app>(app);

    // Reset database
    await resetAll();

    // Mock user data
    await mock_db
      .insert(user)
      .values([
        {
          id: "test-staff-id",
          email: "staff.t@itm.kmutnb.ac.th",
          name: "Staff Test",
        },
        {
          id: "test-student-id",
          email: "s6506022620036@email.kmutnb.ac.th",
          name: "Student Test",
        },
        {
          id: "test-non-staff-id",
          email: "non.s@itm.kmutnb.ac.th",
          name: "Non Staff Test",
        }
      ])
      .onConflictDoNothing()
      .execute();

    // Mock staff list
    await mock_db
      .insert(staff_list)
      .values({
        id: 1,
        user_id: "test-staff-id",
      })
      .onConflictDoNothing()
      .execute();

    // Mock instance course
    await mock_db
      .insert(instance_course)
      .values({
        id: 1,
        course_id: "060233101",
        course_title: "Introduction to Information and Network Engineering",
        main_staff: 1,
      })
      .onConflictDoNothing()
      .execute();

    // Mock PVE node
    await mock_db
      .insert(pve_node)
      .values({
        id: 1,
        name: "Test Node",
        status: "online",
      })
      .onConflictDoNothing()
      .execute();

    // Mock instance template
    await mock_db
      .insert(instance_template)
      .values([
        {
          id: 1,
          os_name: "Ubuntu 20.04",
          vm_type: "qemu",
          vm_template_id: "101",
          vm_template_host: "Test Node",
        }
      ])
      .onConflictDoNothing()
      .execute();
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

  it("should return template autocomplete suggestions", async () => {
    const response = await api.autocomplete.template.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      message: "Get template autocomplete",
      data: expect.any(Array)
    });
  });
});