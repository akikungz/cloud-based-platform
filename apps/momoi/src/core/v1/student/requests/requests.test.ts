import { describe, expect, it, beforeEach, afterEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { resetAll } from "database/functions/test/reset";
import { instance_course, instance_template, pve_node } from "database/schema/core/instances";

import { requests_controller } from "./requests.controller";
import { mock_db } from "database";
import { user } from "database/schema/auth/better-auth";
import { staff_list } from "database/schema/auth/user";

describe("requests_controller", () => {
  let app: typeof requests_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = requests_controller;
    app.use(mockAuthStudent);

    api = treaty<typeof app>(app);

    // Reset database
    await resetAll();

    // Mock user data
    await mock_db.insert(user).values([
      {
        id: "test-student-id",
        email: "s6506022620036@email.kmutnb.ac.th",
        name: "Student Test",
      },
      {
        id: "test-staff-id",
        email: "staff.t@itm.kmutnb.ac.th",
        name: "Staff Test",
      }
    ]).execute();

    // Mock staff list
    await mock_db.insert(staff_list).values({
      id: 1,
      user_id: "test-staff-id",
    }).execute();

    // Mock instance course
    await mock_db.insert(instance_course).values({
      id: 1,
      course_id: "060233101",
      course_title: "Introduction to Information and Network Engineering",
      main_staff: 1,
    }).execute();

    // Mock PVE node
    await mock_db.insert(pve_node).values({
      id: 1,
      name: "Test Node",
      status: "online",
    }).execute();

    // Mock instance template
    await mock_db.insert(instance_template).values({
      id: 1,
      vm_template_id: "101",
      vm_template_host: "Test Node",
      vm_type: "qemu",
      os_name: "Ubuntu 24.04",
    }).execute();
  });

  it("GET /requests - should return 200 for student", async () => {
    const response = await api.requests.get();

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: "Student requests controller", data: [] });
  });

  it("POST /requests - should return 201 for student", async () => {
    const response = await api.requests.post({
      type: "course",
      title: "Test Request",
      description: "This is a test request",
      hostname: "test-host",
      course: 1,
      template: 1,
      cpus: 2,
      memory: 512,
      disk: 16,
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.length).toBe(1);
  });
});