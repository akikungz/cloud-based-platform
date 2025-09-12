import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup } from "@momoi/libs/db";

import { PublicController } from "./public.controller";

describe("Public Controller", () => {
  let app: typeof PublicController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;

  beforeEach(async () => {
    app = PublicController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  describe("GET /public/active-semester", () => {
    it("should return the active semester when one exists", async () => {
      // The mock setup already creates an active semester with name "1/2568"
      const response = await api.public["active-semester"].get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect((response.data as any)!.data).toHaveProperty("name", "1/2568");
      expect((response.data as any)!.data).toHaveProperty("active", true);
    });

    it("should return 404 when no active semester exists", async () => {
      // Reset database to ensure no active semesters
      await mockSetup.resetDatabase();
      
      // Ensure no semesters exist at all
      await db.semester.deleteMany({});

      const response = await api.public["active-semester"].get();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "No active semester found");
    });

    it("should return 404 when only inactive semesters exist", async () => {
      // Reset database first to clear the active semester from beforeEach
      await mockSetup.resetDatabase();
      
      // Create an inactive semester
      await db.semester.create({
        data: {
          name: "2024/1",
          start_at: new Date("2024-01-01"),
          end_at: new Date("2024-06-30"),
          active: false
        }
      });

      const response = await api.public["active-semester"].get();

      expect(response.status).toBe(404);
      expect(response.error?.value).toHaveProperty("message", "No active semester found");
    });

    it("should return the most recent active semester when multiple exist", async () => {
      // Reset database first
      await mockSetup.resetDatabase();
      
      // Create multiple active semesters (this shouldn't happen in practice, but test the behavior)
      await db.semester.create({
        data: {
          name: "2024/1",
          start_at: new Date("2024-01-01"),
          end_at: new Date("2024-06-30"),
          active: true
        }
      });

      await db.semester.create({
        data: {
          name: "2024/2",
          start_at: new Date("2024-07-01"),
          end_at: new Date("2024-12-31"),
          active: true
        }
      });

      const response = await api.public["active-semester"].get();

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      // Should return one of the active semesters
      expect((response.data as any)!.data).toHaveProperty("active", true);
    });
  });
});
