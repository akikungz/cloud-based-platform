import type { PrismaDB } from "database";
import { PrismaMockSetup, PrismaTestScenarios, createPrismaMockSetup } from "./prisma-mock";

/**
 * Test helper utilities for Prisma testing
 */
export class PrismaTestHelpers {
  private db: PrismaDB;
  private mockSetup: PrismaMockSetup;
  private testScenarios: PrismaTestScenarios;

  constructor(db: PrismaDB) {
    this.db = db;
    this.mockSetup = createPrismaMockSetup(db);
    this.testScenarios = new PrismaTestScenarios(this.mockSetup);
  }

  /**
   * Get the mock setup instance
   */
  getMockSetup(): PrismaMockSetup {
    return this.mockSetup;
  }

  /**
   * Get the test scenarios instance
   */
  getTestScenarios(): PrismaTestScenarios {
    return this.testScenarios;
  }

  /**
   * Get the database instance
   */
  getDb(): PrismaDB {
    return this.db;
  }

  /**
   * Assert that a user exists in the database
   */
  async assertUserExists(userId: string): Promise<void> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
  }

  /**
   * Assert that an instance exists in the database
   */
  async assertInstanceExists(instanceId: number): Promise<void> {
    const instance = await this.db.instance.findUnique({
      where: { id: instanceId },
    });
    if (!instance) {
      throw new Error(`Instance with id ${instanceId} not found`);
    }
  }

  /**
   * Assert that an instance request exists in the database
   */
  async assertInstanceRequestExists(requestId: number): Promise<void> {
    const request = await this.db.instance_request.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new Error(`Instance request with id ${requestId} not found`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<any> {
    return await this.db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get all instances for a user
   */
  async getUserInstances(userId: string): Promise<any[]> {
    return await this.db.instance.findMany({
      where: { user_id: userId },
      include: {
        user: true,
        course: true,
        template: true,
        samester: true,
        ip_address: true,
      },
    });
  }

  /**
   * Get all instance requests for a user
   */
  async getUserInstanceRequests(userId: string): Promise<any[]> {
    return await this.db.instance_request.findMany({
      where: { user_id: userId },
      include: {
        user: true,
        course: true,
        template: true,
        extends: true,
      },
    });
  }

  /**
   * Get all staff members
   */
  async getAllStaff(): Promise<any[]> {
    return await this.db.staff_list.findMany({
      where: { deleted_at: null },
    });
  }

  /**
   * Get all active instances
   */
  async getActiveInstances(): Promise<any[]> {
    return await this.db.instance.findMany({
      where: { 
        state: "active",
        deleted_at: null,
      },
      include: {
        user: true,
        course: true,
        template: true,
        samester: true,
        ip_address: true,
      },
    });
  }

  /**
   * Get all pending instance requests
   */
  async getPendingInstanceRequests(): Promise<any[]> {
    return await this.db.instance_request.findMany({
      where: { state: "pending" },
      include: {
        user: true,
        course: true,
        template: true,
      },
    });
  }

  /**
   * Get all available IP addresses
   */
  async getAvailableIpAddresses(): Promise<any[]> {
    return await this.db.ip_address.findMany({
      where: { 
        is_used: false,
        deleted_at: null,
      },
      include: {
        network: true,
      },
    });
  }

  /**
   * Get all online PVE nodes
   */
  async getOnlinePveNodes(): Promise<any[]> {
    return await this.db.pve_node.findMany({
      where: { 
        status: "online",
        deleted_at: null,
      },
    });
  }

  /**
   * Get current active samester
   */
  async getCurrentSamester(): Promise<any> {
    return await this.db.samester.findFirst({
      where: { active: true },
    });
  }

  /**
   * Count instances by status
   */
  async countInstancesByStatus(status: string): Promise<number> {
    return await this.db.instance.count({
      where: { status: status as any },
    });
  }

  /**
   * Count instance requests by state
   */
  async countInstanceRequestsByState(state: string): Promise<number> {
    return await this.db.instance_request.count({
      where: { state: state as any },
    });
  }

  /**
   * Get instance with full relations
   */
  async getInstanceWithRelations(instanceId: number): Promise<any> {
    return await this.db.instance.findUnique({
      where: { id: instanceId },
      include: {
        user: true,
        course: true,
        template: true,
        samester: true,
        ip_address: {
          include: {
            network: true,
          },
        },
        instance_request_extends: true,
      },
    });
  }

  /**
   * Get instance request with full relations
   */
  async getInstanceRequestWithRelations(requestId: number): Promise<any> {
    return await this.db.instance_request.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        course: true,
        template: true,
        extends: true,
      },
    });
  }

  /**
   * Clean up test data (alternative to resetDatabase for selective cleanup)
   */
  async cleanupTestData(): Promise<void> {
    // Delete test instances and related data
    await this.db.instance_request_extends.deleteMany({
      where: {
        OR: [
          { instance: { user_id: { startsWith: "test-" } } },
          { instance_request: { user_id: { startsWith: "test-" } } },
        ],
      },
    });

    await this.db.instance_request.deleteMany({
      where: { user_id: { startsWith: "test-" } },
    });

    await this.db.instance.deleteMany({
      where: { user_id: { startsWith: "test-" } },
    });

    await this.db.user.deleteMany({
      where: { id: { startsWith: "test-" } },
    });
  }

  /**
   * Create a test user with specific properties
   */
  async createTestUser(overrides: {
    id?: string;
    email?: string;
    name?: string;
    email_verified?: boolean;
  } = {}): Promise<any> {
    const defaultUser = {
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      email_verified: true,
    };

    return await this.db.user.create({
      data: { ...defaultUser, ...overrides },
    });
  }

  /**
   * Create a test instance with specific properties
   */
  async createTestInstance(overrides: {
    user_id?: string;
    title?: string;
    hostname?: string;
    course_id?: number;
    template_id?: number;
    cpus?: number;
    memory?: number;
    disk?: number;
  } = {}): Promise<any> {
    const defaultInstance = {
      user_id: "test-student-id",
      title: "Test Instance",
      hostname: "test-instance",
      description: "Test instance description",
      type: "course" as const,
      course_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 2048,
      disk: 20,
      state: "active" as const,
      status: "running" as const,
      pve_node: "Test Node",
      vm_id: Math.floor(Math.random() * 10000),
    };

    return await this.db.instance.create({
      data: { ...defaultInstance, ...overrides },
    });
  }

  /**
   * Create a test instance request with specific properties
   */
  async createTestInstanceRequest(overrides: {
    user_id?: string;
    title?: string;
    hostname?: string;
    course_id?: number;
    template_id?: number;
    cpus?: number;
    memory?: number;
    disk?: number;
    type?: "course" | "project";
  } = {}): Promise<any> {
    const defaultRequest = {
      user_id: "test-student-id",
      title: "Test Request",
      hostname: "test-request",
      description: "Test request description",
      type: "course" as const,
      course_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 2048,
      disk: 20,
      state: "pending" as const,
    };

    return await this.db.instance_request.create({
      data: { ...defaultRequest, ...overrides },
    });
  }
}

/**
 * Factory function to create test helpers
 */
export function createPrismaTestHelpers(db: PrismaDB): PrismaTestHelpers {
  return new PrismaTestHelpers(db);
}

/**
 * Common test assertions
 */
export class PrismaTestAssertions {
  /**
   * Assert that two objects have the same properties (shallow comparison)
   */
  static assertObjectPropertiesMatch(actual: any, expected: any, properties: string[]): void {
    for (const prop of properties) {
      if (actual[prop] !== expected[prop]) {
        throw new Error(`Property ${prop} mismatch: expected ${expected[prop]}, got ${actual[prop]}`);
      }
    }
  }

  /**
   * Assert that a date is within a reasonable range (for created_at, updated_at)
   */
  static assertDateIsRecent(date: Date, maxMinutesAgo: number = 5): void {
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffMinutes > maxMinutesAgo) {
      throw new Error(`Date ${date.toISOString()} is more than ${maxMinutesAgo} minutes old`);
    }
  }

  /**
   * Assert that an array contains an object with specific properties
   */
  static assertArrayContainsObject(array: any[], expectedObject: any, properties: string[]): void {
    const found = array.find(item => 
      properties.every(prop => item[prop] === expectedObject[prop])
    );
    
    if (!found) {
      throw new Error(`Array does not contain object with properties: ${JSON.stringify(expectedObject)}`);
    }
  }

  /**
   * Assert that a number is within a range
   */
  static assertNumberInRange(value: number, min: number, max: number): void {
    if (value < min || value > max) {
      throw new Error(`Value ${value} is not within range [${min}, ${max}]`);
    }
  }
}
