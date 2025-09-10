import type { PrismaDB } from "database";

/**
 * Mock data generators for Prisma models
 */
export class PrismaMockData {
  /**
   * Generate mock user data
   */
  static users = {
    student: {
      id: "test-student-id",
      email: "s6506022620036@email.kmutnb.ac.th",
      name: "Student Test",
      email_verified: true,
      image: null,
    },
    staff: {
      id: "test-staff-id", 
      email: "staff.t@itm.kmutnb.ac.th",
      name: "Staff Test",
      email_verified: true,
      image: null,
    },
    admin: {
      id: "test-admin-id",
      email: "admin@itm.kmutnb.ac.th", 
      name: "Admin Test",
      email_verified: true,
      image: null,
    }
  };

  /**
   * Generate mock staff list data
   */
  static staffList = {
    main: {
      id: 1,
      email: "staff.t@itm.kmutnb.ac.th",
    },
    assistant1: {
      id: 2,
      email: "assistant1@itm.kmutnb.ac.th",
    },
    assistant2: {
      id: 3,
      email: "assistant2@itm.kmutnb.ac.th",
    }
  };

  /**
   * Generate mock instance course data
   */
  static instanceCourses = {
    intro: {
      id: 1,
      course_id: "060233101",
      course_title: "Introduction to Information and Network Engineering",
      main_staff: 1,
      assistant_staff_1: 2,
      assistant_staff_2: 3,
    },
    advanced: {
      id: 2,
      course_id: "060233201", 
      course_title: "Advanced Network Engineering",
      main_staff: 1,
    }
  };

  /**
   * Generate mock PVE node data
   */
  static pveNodes = {
    primary: {
      id: 1,
      name: "Test Node",
      status: "online" as const,
    },
    secondary: {
      id: 2,
      name: "Test Node 2", 
      status: "online" as const,
    },
    maintenance: {
      id: 3,
      name: "Maintenance Node",
      status: "maintenance" as const,
    }
  };

  /**
   * Generate mock instance template data
   */
  static instanceTemplates = {
    ubuntu: {
      id: 1,
      os_name: "Ubuntu 24.04",
      vm_template_id: "101",
      vm_template_host: "Test Node",
      vm_type: "qemu" as const,
    },
    centos: {
      id: 2,
      os_name: "CentOS 8",
      vm_template_id: "102", 
      vm_template_host: "Test Node 2",
      vm_type: "lxc" as const,
    }
  };

  /**
   * Generate mock network data
   */
  static networks = {
    primary: {
      id: 1,
      name: "Test Network",
      network: "10.20.31.0/24",
      gateway: "10.20.31.1",
    },
    secondary: {
      id: 2,
      name: "Secondary Network",
      network: "10.20.32.0/24", 
      gateway: "10.20.32.1",
    }
  };

  /**
   * Generate mock IP address data
   */
  static ipAddresses = {
    primary: [
      { id: 1, network_id: 1, ip: "10.20.31.2/24", is_used: false },
      { id: 2, network_id: 1, ip: "10.20.31.3/24", is_used: false },
      { id: 3, network_id: 1, ip: "10.20.31.4/24", is_used: false },
      { id: 4, network_id: 1, ip: "10.20.31.5/24", is_used: false },
      { id: 5, network_id: 1, ip: "10.20.31.6/24", is_used: false },
    ],
    secondary: [
      { id: 6, network_id: 2, ip: "10.20.32.2/24", is_used: false },
      { id: 7, network_id: 2, ip: "10.20.32.3/24", is_used: false },
    ]
  };

  /**
   * Generate mock semester data
   */
  static semesters = {
    current: {
      id: 1,
      name: "1/2568",
      start_at: new Date("2024-06-01"),
      end_at: new Date("2024-10-30"),
      active: true,
    },
    next: {
      id: 2,
      name: "2/2568",
      start_at: new Date("2024-11-01"),
      end_at: new Date("2025-03-31"),
      active: false,
    }
  };

  /**
   * Generate mock instance data
   */
  static instances = {
    active: {
      id: 1,
      user_id: "test-student-id",
      title: "Test Instance",
      hostname: "test-instance",
      description: "This is a test instance",
      type: "course" as const,
      course_id: 1,
      semester_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 2048,
      disk: 20,
      state: "active" as const,
      status: "running" as const,
      pve_node: "Test Node",
      vm_id: 1001,
      ip_address_id: 1,
    },
    pending: {
      id: 2,
      user_id: "test-student-id",
      title: "Pending Instance",
      hostname: "pending-instance",
      description: "This is a pending instance",
      type: "project" as const,
      course_id: 1,
      template_id: 1,
      cpus: 1,
      memory: 1024,
      disk: 10,
      state: "active" as const,
      status: "pending" as const,
      pve_node: "Test Node",
      vm_id: 1002,
    }
  };

  /**
   * Generate mock instance request data
   */
  static instanceRequests = {
    course: {
      id: 1,
      user_id: "test-student-id",
      title: "Course Request",
      hostname: "course-request",
      description: "This is a course request",
      type: "course" as const,
      course_id: 1,
      template_id: 1,
      cpus: 2,
      memory: 2048,
      disk: 20,
      state: "pending" as const,
    },
    project: {
      id: 2,
      user_id: "test-student-id",
      title: "Project Request",
      hostname: "project-request", 
      description: "This is a project request",
      type: "project" as const,
      course_id: 1,
      template_id: 1,
      cpus: 1,
      memory: 1024,
      disk: 10,
      state: "approved" as const,
    }
  };

  /**
   * Generate mock instance request extends data
   */
  static instanceRequestExtends = {
    basic: {
      id: 1,
      instance_id: 1,
      title: "Extend Request",
      description: "This is an extend request",
      state: "pending" as const,
      instance_requestId: null,
    }
  };

}

/**
 * Prisma Mock Database Setup Utility
 */
export class PrismaMockSetup {
  public db: PrismaDB;

  constructor(db: PrismaDB) {
    this.db = db;
  }

  /**
   * Reset all database tables (delete in correct order to respect foreign keys)
   */
  async resetDatabase(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await this.db.instance_request_extends.deleteMany();
    await this.db.instance_request.deleteMany();
    await this.db.instance.deleteMany();
    await this.db.ip_address.deleteMany();
    await this.db.network.deleteMany();
    await this.db.instance_template.deleteMany();
    await this.db.pve_node.deleteMany();
    await this.db.instance_course.deleteMany();
    await this.db.staff_list.deleteMany();
    await this.db.semester.deleteMany();
    await this.db.user.deleteMany();
    // Note: session, account, verification, and user_public_key tables may not exist in all schemas
    // Only delete them if they exist
    try {
      await this.db.session?.deleteMany();
    } catch (e) {
      // Table doesn't exist, skip
    }
    try {
      await this.db.account?.deleteMany();
    } catch (e) {
      // Table doesn't exist, skip
    }
    try {
      await this.db.verification?.deleteMany();
    } catch (e) {
      // Table doesn't exist, skip
    }
    try {
      await this.db.user_public_key?.deleteMany();
    } catch (e) {
      // Table doesn't exist, skip
    }
  }

  /**
   * Setup basic test data (users, staff, courses, etc.)
   */
  async setupBasicData(): Promise<void> {
    // Create users
    await this.db.user.createMany({
      data: [
        PrismaMockData.users.student,
        PrismaMockData.users.staff,
        PrismaMockData.users.admin,
      ],
      skipDuplicates: true,
    });

    // Create staff list
    await this.db.staff_list.createMany({
      data: [
        PrismaMockData.staffList.main,
        PrismaMockData.staffList.assistant1,
        PrismaMockData.staffList.assistant2,
      ],
      skipDuplicates: true,
    });

    // Create instance courses
    await this.db.instance_course.createMany({
      data: [
        PrismaMockData.instanceCourses.intro,
        PrismaMockData.instanceCourses.advanced,
      ],
      skipDuplicates: true,
    });

    // Create PVE nodes
    await this.db.pve_node.createMany({
      data: [
        PrismaMockData.pveNodes.primary,
        PrismaMockData.pveNodes.secondary,
        PrismaMockData.pveNodes.maintenance,
      ],
      skipDuplicates: true,
    });

    // Create instance templates
    await this.db.instance_template.createMany({
      data: [
        PrismaMockData.instanceTemplates.ubuntu,
        PrismaMockData.instanceTemplates.centos,
      ],
      skipDuplicates: true,
    });

    // Create networks
    await this.db.network.createMany({
      data: [
        PrismaMockData.networks.primary,
        PrismaMockData.networks.secondary,
      ],
      skipDuplicates: true,
    });

    // Create IP addresses
    await this.db.ip_address.createMany({
      data: [
        ...PrismaMockData.ipAddresses.primary,
        ...PrismaMockData.ipAddresses.secondary,
      ],
      skipDuplicates: true,
    });

    // Create semesters
    await this.db.semester.createMany({
      data: [
        PrismaMockData.semesters.current,
        PrismaMockData.semesters.next,
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Setup instance data
   */
  async setupInstanceData(): Promise<void> {
    await this.db.instance.createMany({
      data: [
        PrismaMockData.instances.active,
        PrismaMockData.instances.pending,
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Setup instance request data
   */
  async setupInstanceRequestData(): Promise<void> {
    await this.db.instance_request.createMany({
      data: [
        PrismaMockData.instanceRequests.course,
        PrismaMockData.instanceRequests.project,
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Setup instance request extends data
   */
  async setupInstanceRequestExtendsData(): Promise<void> {
    await this.db.instance_request_extends.createMany({
      data: [
        PrismaMockData.instanceRequestExtends.basic,
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Setup semester data
   */
  async setupSemesterData(): Promise<void> {
    await this.db.semester.createMany({
      data: [
        PrismaMockData.semesters.current,
        PrismaMockData.semesters.next,
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Setup complete test environment
   */
  async setupCompleteTestEnvironment(): Promise<void> {
    await this.resetDatabase();
    await this.setupBasicData();
    await this.setupInstanceData();
    await this.setupInstanceRequestData();
    await this.setupInstanceRequestExtendsData();
  }

  /**
   * Create a custom user for testing
   */
  async createCustomUser(userData: Partial<typeof PrismaMockData.users.student>): Promise<any> {
    return await this.db.user.create({
      data: {
        ...PrismaMockData.users.student,
        ...userData,
      },
    });
  }

  /**
   * Create a custom instance for testing
   */
  async createCustomInstance(instanceData: Partial<typeof PrismaMockData.instances.active>): Promise<any> {
    return await this.db.instance.create({
      data: {
        ...PrismaMockData.instances.active,
        ...instanceData,
      },
    });
  }

  /**
   * Create a custom instance request for testing
   */
  async createCustomInstanceRequest(requestData: Partial<typeof PrismaMockData.instanceRequests.course>): Promise<any> {
    return await this.db.instance_request.create({
      data: {
        ...PrismaMockData.instanceRequests.course,
        ...requestData,
      },
    });
  }
}

/**
 * Factory function to create a Prisma mock setup instance
 */
export function createPrismaMockSetup(db: PrismaDB): PrismaMockSetup {
  return new PrismaMockSetup(db);
}

/**
 * Common test scenarios
 */
export class PrismaTestScenarios {
  private mockSetup: PrismaMockSetup;

  constructor(mockSetup: PrismaMockSetup) {
    this.mockSetup = mockSetup;
  }

  /**
   * Scenario: Student with active instance
   */
  async studentWithActiveInstance(): Promise<void> {
    await this.mockSetup.setupCompleteTestEnvironment();
  }

  /**
   * Scenario: Student with pending request
   */
  async studentWithPendingRequest(): Promise<void> {
    await this.mockSetup.resetDatabase();
    await this.mockSetup.setupBasicData();
    await this.mockSetup.setupInstanceRequestData();
  }

  /**
   * Scenario: Staff member with multiple courses
   */
  async staffWithMultipleCourses(): Promise<void> {
    await this.mockSetup.resetDatabase();
    await this.mockSetup.setupBasicData();
    // Add additional courses for staff
    await this.mockSetup.db.instance_course.createMany({
      data: [
        { id: 3, course_id: "060233301", course_title: "Network Security", main_staff: 1 },
        { id: 4, course_id: "060233401", course_title: "Cloud Computing", main_staff: 1 },
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Scenario: System with maintenance node
   */
  async systemWithMaintenanceNode(): Promise<void> {
    await this.mockSetup.setupCompleteTestEnvironment();
    // Update one node to maintenance status
    await this.mockSetup.db.pve_node.update({
      where: { id: 1 },
      data: { status: "maintenance" },
    });
  }
}
