import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db } from "@momoi/libs/db";

import { instances_controller } from "./instances.controller";

describe("instances_controller", () => {
  let app: typeof instances_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = instances_controller;
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