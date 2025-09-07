import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { mockAuthStudent } from "@momoi/core/auth/auth.service-test";

import { resetAll } from "database/functions/test/reset";
import { instance, instance_course, instance_template, pve_node } from "database/schema/core/instances";

import { requests_controller } from "./requests.controller";
import { mock_db } from "database";
import { user } from "database/schema/auth/better-auth";
import { staff_list } from "database/schema/auth/user";
import { ip_address, network } from "database/schema/core/network";
import { samester } from "database/schema/core/samester";

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
    await mock_db
      .insert(user)
      .values([
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
      .values({
        id: 1,
        vm_template_id: "101",
        vm_template_host: "Test Node",
        vm_type: "qemu",
        os_name: "Ubuntu 24.04",
      })
      .onConflictDoNothing()
      .execute();

    // Mock network
    await mock_db
      .insert(network)
      .values({
        id: 1,
        name: "Test Network",
        network: "10.20.31.0/24",
        gateway: "10.20.31.1"
      })
      .onConflictDoNothing()
      .execute();

    // Mock ip address
    await mock_db
      .insert(ip_address)
      .values([2, 3, 4, 5, 6].map((i, index) => ({
        id: index + 1,
        network: 1,
        ip: `10.20.31.${i}/24`,
      })))
      .onConflictDoNothing()
      .execute();

    // Mock samester
    await mock_db
      .insert(samester)
      .values([
        {
          id: 1,
          name: "1/2568",
          start_at: new Date("2024-06-01"),
          end_at: new Date("2024-10-30"),
          active: true,
        },
        {
          id: 2,
          name: "2/2568",
          start_at: new Date("2024-11-01"),
          end_at: new Date("2025-03-31"),
          active: false,
        }
      ])
      .onConflictDoNothing()
      .execute();

    // Mock instance
    await mock_db
      .insert(instance)
      .values({
        id: 1,
        course: 1,
        title: "Test Instance",
        description: "This is a test instance",
        type: "course",
        hostname: "test-instance",
        user: "test-student-id",
        template: 1,
        pve_node: "Test Node",
        vm_id: 1001,
        status: "running",
        ip_address: "10.20.31.2/24",
        cpus: 2,
        memory: 2048,
        disk: 20,
        samester: 1,
      })
      .onConflictDoNothing()
      .execute();
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
    expect(check_response.data!.data.requests.length).toBe(1);
  });

  it("POST /requests/extend", async () => {
    const response = await api.requests.extend.post({
      instance: 1,
      title: "Extend Request",
      description: "This is a test extend request",
    });

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new extend request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.extend_requests.length).toBe(1);
  });
});