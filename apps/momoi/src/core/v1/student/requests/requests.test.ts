import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db } from "@momoi/libs/db";

import { requests_controller } from "./requests.controller";

describe("requests_controller", () => {
  let app: typeof requests_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = requests_controller;

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
        { id: "test-student-id", email: "s6506022620036@email.kmutnb.ac.th", name: "Student Test" },
        { id: "test-staff-id", email: "staff.t@itm.kmutnb.ac.th", name: "Staff Test" }
      ],
      skipDuplicates: true
    });

    // Mock staff list
    await db.staff_list.create({ data: { id: 1, user_id: "test-staff-id", is_staff: true } });

    // Mock instance course
    await db.instance_course.create({
      data: { id: 1, course_id: "060233101", course_title: "Introduction to Information and Network Engineering", main_staff: 1 }
    });

    // Mock PVE node
    await db.pve_node.create({ data: { id: 1, name: "Test Node", status: "online" } });

    // Mock instance template
    await db.instance_template.create({
      data: { id: 1, vm_template_id: "101", vm_template_host: "Test Node", vm_type: "qemu", os_name: "Ubuntu 24.04" }
    });

    // Mock network
    await db.network.create({
      data: { id: 1, name: "Test Network", network: "10.20.31.0/24", gateway: "10.20.31.1" }
    });

    // Mock ip address
    await db.ip_address.createMany({
      data: [2, 3, 4, 5, 6].map((i, index) => ({ id: index + 1, network_id: 1, ip: `10.20.31.${i}/24` })),
      skipDuplicates: true
    });

    // Mock samester
    await db.samester.createMany({
      data: [
        { id: 1, name: "1/2568", start_at: new Date("2024-06-01"), end_at: new Date("2024-10-30"), active: true },
        { id: 2, name: "2/2568", start_at: new Date("2024-11-01"), end_at: new Date("2025-03-31"), active: false }
      ],
      skipDuplicates: true
    });

    // Mock instance
    await db.instance.create({
      data: {
        id: 1,
        course_id: 1,
        title: "Test Instance",
        description: "This is a test instance",
        type: "course",
        hostname: "test-instance",
        user_id: "test-student-id",
        template_id: 1,
        pve_node: "Test Node",
        vm_id: 1001,
        status: "running",
        ip_address: "10.20.31.2/24",
        cpus: 2,
        memory: 2048,
        disk: 20,
        samester_id: 1,
        state: "active"
      }
    });
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
    expect(check_response.data!.data.requests.length).toBe(1);
  });

  it("POST /requests/extend", async () => {
    const response = await api.requests.extend.post({
      instance_id: 1,
      title: "Extend Request",
      description: "This is a test extend request",
    } as any);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("message", "Create a new extend request");

    const check_response = await api.requests.get();
    expect(check_response.data).toHaveProperty("data");
    expect(check_response.data!.data.extend_requests.length).toBe(1);
  });
});