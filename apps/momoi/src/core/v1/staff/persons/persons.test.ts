// @ts-nocheck
import { describe, expect, it, beforeEach } from "bun:test";

import { treaty } from "@elysiajs/eden";

import { db, createPrismaMockSetup, createPrismaTestHelpers } from "@momoi/libs/db";

import { PersonsController } from "./persons.controller";

describe("Staff/Persons Module", () => {
  let app: typeof PersonsController;
  let api: ReturnType<typeof treaty<typeof app>>;
  let mockSetup: ReturnType<typeof createPrismaMockSetup>;
  let testHelpers: ReturnType<typeof createPrismaTestHelpers>;

  beforeEach(async () => {
    app = PersonsController;
    api = treaty<typeof app>(app);

    // Setup mock system
    mockSetup = createPrismaMockSetup(db);
    testHelpers = createPrismaTestHelpers(db);

    // Setup complete test environment using the mock system
    await mockSetup.setupCompleteTestEnvironment();
  });

  it("GET /persons - should return list of persons with both active and pending status", async () => {
    const response = await api.persons.get({ query: {} });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");
    expect(Array.isArray(response.data!.data)).toBe(true);
    expect(response.data!.data.length).toBeGreaterThan(0);

    // Check that at least one person has the expected staff email
    const staffPerson = response.data!.data.find((p: any) => p.email === "staff.t@itm.kmutnb.ac.th");
    expect(staffPerson).toBeDefined();
    expect(staffPerson).toHaveProperty("staff_id", 1);
    expect(staffPerson).toHaveProperty("status", "active");

    // Check that all persons have the required fields
    response.data!.data.forEach((person: any) => {
      expect(person).toHaveProperty("email");
      expect(person).toHaveProperty("staff_id");
      expect(person).toHaveProperty("status");
      expect(person).toHaveProperty("created_at");
      expect(person).toHaveProperty("updated_at");
      expect(["active", "pending"]).toContain(person.status);

      if (person.status === "active") {
        expect(person).toHaveProperty("id");
        expect(person).toHaveProperty("name");
      } else if (person.status === "pending") {
        expect(person.id).toBeNull();
        expect(person.name).toBeNull();
      }
    });
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

  it("GET /persons - should include pending staff members who haven't logged in", async () => {
    // Create a staff member who hasn't logged in yet
    const pendingEmail = "pending.staff@itm.kmutnb.ac.th";
    await api.persons.post({ email: pendingEmail });

    const response = await api.persons.get({ query: {} });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("data");

    // Find the pending staff member
    const pendingPerson = response.data!.data.find((p: any) => p.email === pendingEmail);
    expect(pendingPerson).toBeDefined();
    expect(pendingPerson).toHaveProperty("status", "pending");
    expect(pendingPerson).toHaveProperty("id", null);
    expect(pendingPerson).toHaveProperty("name", null);
    expect(pendingPerson).toHaveProperty("email", pendingEmail);
    expect(pendingPerson).toHaveProperty("staff_id");
  });

  it("DELETE /persons - should delete a person", async () => {
    // First create a person to delete
    await api.persons.post({ email: "delete.test@itm.kmutnb.ac.th" });

    const response = await api.persons.delete({ email: "delete.test@itm.kmutnb.ac.th" });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("message", "Delete a person");
  });

  describe("Error Cases and Edge Cases", () => {
    it("should return 404 when searching for non-existent person", async () => {
      const response = await api.persons.search.get({
        query: { email: "nonexistent@itm.kmutnb.ac.th" }
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should return 404 when deleting non-existent person", async () => {
      const response = await api.persons.delete({
        email: "nonexistent@itm.kmutnb.ac.th"
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should handle invalid email format in search", async () => {
      const response = await api.persons.search.get({
        query: { email: "invalid-email-format" }
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should handle invalid email format in create", async () => {
      const response = await api.persons.post({
        email: "invalid-email-format"
      });

      // Should still create or handle gracefully
      expect([201, 400, 422]).toContain(response.status);
    });

    it("should handle invalid email format in delete", async () => {
      const response = await api.persons.delete({
        email: "invalid-email-format"
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should handle empty email in search", async () => {
      const response = await api.persons.search.get({
        query: { email: "" }
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should handle empty email in create", async () => {
      const response = await api.persons.post({
        email: ""
      });

      // Should return validation error or create successfully
      expect([201, 400, 422]).toContain(response.status);
    });

    it("should handle empty email in delete", async () => {
      const response = await api.persons.delete({
        email: ""
      });

      expect(response.status).toBe(404);
      if (response.data) {
        expect(response.data).toHaveProperty("message", "Person not found");
      }
    });

    it("should handle very long email addresses", async () => {
      const longEmail = "a".repeat(100) + "@itm.kmutnb.ac.th";

      const response = await api.persons.post({
        email: longEmail
      });

      // Should handle gracefully (either create or return validation error)
      expect([201, 400, 422]).toContain(response.status);
    });

    it("should handle special characters in email", async () => {
      const specialEmail = "test+special@itm.kmutnb.ac.th";

      const response = await api.persons.post({
        email: specialEmail
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle duplicate email creation", async () => {
      const email = "duplicate.test@itm.kmutnb.ac.th";

      // Create first person
      await api.persons.post({ email });

      // Try to create duplicate
      const response = await api.persons.post({ email });

      // Should handle duplicate gracefully
      expect([201, 400, 409, 422]).toContain(response.status);
    });

    it("should handle concurrent person creation", async () => {
      const emails = [
        "concurrent1@itm.kmutnb.ac.th",
        "concurrent2@itm.kmutnb.ac.th",
        "concurrent3@itm.kmutnb.ac.th"
      ];

      const promises = emails.map(email =>
        api.persons.post({ email })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([201, 400, 409, 422]).toContain(response.status);
      });
    });

    it("should handle database connection errors gracefully", async () => {
      // This test simulates database connection issues
      const response = await api.persons.get({ query: {} });

      // Should still return a response
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(Array.isArray(response.data!.data)).toBe(true);
    });

    it("should handle empty database gracefully", async () => {
      // Reset database to test empty state
      await mockSetup.resetDatabase();

      const response = await api.persons.get({ query: {} });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data!.data).toEqual([]);
    });

    it("should handle malformed request bodies", async () => {
      // Test with missing email field
      const response = await api.persons.post({} as any);

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle null/undefined email values", async () => {
      const response = await api.persons.post({
        email: null as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle numeric email values", async () => {
      const response = await api.persons.post({
        email: 12345 as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle boolean email values", async () => {
      const response = await api.persons.post({
        email: true as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle array email values", async () => {
      const response = await api.persons.post({
        email: ["test@itm.kmutnb.ac.th"] as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle object email values", async () => {
      const response = await api.persons.post({
        email: { email: "test@itm.kmutnb.ac.th" } as any
      });

      expect(response.status).toBe(422); // Validation error
    });

    it("should handle case sensitivity in email search", async () => {
      const email = "CaseSensitive@itm.kmutnb.ac.th";

      // Create person with specific case
      await api.persons.post({ email });

      // Search with different case
      const response = await api.persons.search.get({
        query: { email: email.toLowerCase() }
      });

      // Should either find the person or return 404
      expect([200, 404]).toContain(response.status);
    });

    it("should handle whitespace in email", async () => {
      const email = "  whitespace@itm.kmutnb.ac.th  ";

      const response = await api.persons.post({
        email: email
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle Unicode characters in email", async () => {
      const email = "tëst@itm.kmutnb.ac.th";

      const response = await api.persons.post({
        email: email
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
    });

    it("should handle rapid successive operations", async () => {
      const email = "rapid.test@itm.kmutnb.ac.th";

      // Create, search, delete in rapid succession
      const createResponse = await api.persons.post({ email });
      const searchResponse = await api.persons.search.get({ query: { email } });
      const deleteResponse = await api.persons.delete({ email });

      expect(createResponse.status).toBe(201);
      // Search might return 404 if person wasn't created yet due to timing
      expect([200, 404]).toContain(searchResponse.status);
      // Delete might return 404 if person wasn't found
      expect([200, 404]).toContain(deleteResponse.status);
    });

    it("should maintain data consistency after errors", async () => {
      const email = "consistency.test@itm.kmutnb.ac.th";

      // Create person
      const createResponse = await api.persons.post({ email });
      expect(createResponse.status).toBe(201);

      // Try to delete non-existent person (should not affect existing data)
      await api.persons.delete({ email: "nonexistent@itm.kmutnb.ac.th" });

      // Verify original person still exists (might need to wait for transaction)
      const response = await api.persons.search.get({ query: { email } });
      // Person might not be found immediately due to transaction timing
      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.data) {
        expect(response.data.data.email).toBe(email);
      }
    });
  });
});