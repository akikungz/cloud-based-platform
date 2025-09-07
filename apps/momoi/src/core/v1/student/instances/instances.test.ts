import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { mock_db } from "database";
import { resetAll } from "database/functions/test/reset";
import { user } from "database/schema/auth/better-auth";
import { staff_list } from "database/schema/auth/user";
import { instance, instance_course, instance_template, pve_node } from "database/schema/core/instances";
import { ip_address, network } from "database/schema/core/network";
import { samester } from "database/schema/core/samester";

import { instances_controller } from "./instances.controller";

describe("instances_controller", () => {
  let app: typeof instances_controller;
  let api: ReturnType<typeof treaty<typeof app>>;

  beforeEach(async () => {
    app = instances_controller;
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
    expect((response.data!.data as any).instance).toHaveProperty("id", 1);
  });

  it("DELETE /1 should delete instance", async () => {
    const response = await api.instances({ id: 1 }).delete();

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data!.message).toBe("Instance deleted successfully");
  });
});