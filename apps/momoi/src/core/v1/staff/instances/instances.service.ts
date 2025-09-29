import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";
import { getRabbitMQPublisher } from "@momoi/libs/rabbitmq";

export class StaffInstanceService {

  public static async getAllInstances() {
    try {
      const results = await db.instance.findMany({
        where: { NOT: { state: "deleted" } },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          type: true,
          cpus: true,
          memory: true,
          disk: true,
          ip_address: {
            select: {
              ip: true
            }
          },
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          semester: { 
            select: { 
              name: true,
              id: true
            } 
          },
          course: {
            select: {
              course_title: true,
              id: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return results.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        type: r.type,
        semester: r.semester?.name || "No Semester",
        course: r.course?.course_title || "No Course",
        cpus: r.cpus,
        memory: r.memory,
        disk: r.disk,
        ip_address: r.ip_address?.ip || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user: {
          id: r.user.id,
          email: r.user.email,
          name: r.user.name || "No name"
        }
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instances");
    }
  }

  public static async getInstanceById(id: number) {
    try {
      const result = await db.instance.findFirst({
        where: { 
          id: id,
          NOT: { state: "deleted" } 
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          type: true,
          cpus: true,
          memory: true,
          disk: true,
          ip_address: {
            select: {
              ip: true
            }
          },
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          semester: { 
            select: { 
              name: true,
              id: true
            } 
          },
          course: {
            select: {
              course_title: true,
              id: true
            }
          }
        }
      });

      if (!result) {
        throw new NotFoundError("Instance not found");
      }

      return {
        id: result.id,
        title: result.title,
        description: result.description,
        status: result.status,
        type: result.type,
        semester: result.semester?.name || "No Semester",
        course: result.course?.course_title || "No Course",
        cpus: result.cpus,
        memory: result.memory,
        disk: result.disk,
        ip_address: result.ip_address?.ip || null,
        created_at: result.created_at,
        updated_at: result.updated_at,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || "No name"
        }
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance");
    }
  }

  public static async getInstancesStats() {
    try {
      const totalInstances = await db.instance.count({
        where: { NOT: { state: "deleted" } }
      });

      const runningInstances = await db.instance.count({
        where: { 
          status: "running",
          NOT: { state: "deleted" } 
        }
      });

      const stoppedInstances = await db.instance.count({
        where: { 
          status: "stopped",
          NOT: { state: "deleted" } 
        }
      });

      const pendingInstances = await db.instance.count({
        where: { 
          status: "pending",
          NOT: { state: "deleted" } 
        }
      });

      return {
        total: totalInstances,
        running: runningInstances,
        stopped: stoppedInstances,
        pending: pendingInstances
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch instance statistics");
    }
  }

  /**
   * Create an instance directly for staff without requiring a request or semester lock
   */
  public static async createInstanceDirectly(data: {
    user_id: string;
    title: string;
    hostname: string;
    description: string;
    type: 'course' | 'personal';
    course_id: number;
    template_id: number;
    cpus: number;
    memory: number;
    disk: number;
    semester_id?: number; // Optional - if not provided, will use active semester or create without semester
  }) {
    try {
      // Validate that the user exists
      const user = await db.user.findUnique({
        where: { id: data.user_id }
      });

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Validate that the course exists
      const course = await db.instance_course.findFirst({
        where: { 
          id: data.course_id,
          deleted_at: null 
        }
      });

      if (!course) {
        throw new NotFoundError("Course not found");
      }

      // Validate that the template exists
      const template = await db.instance_template.findFirst({
        where: { 
          id: data.template_id,
          deleted_at: null 
        }
      });

      if (!template) {
        throw new NotFoundError("Template not found");
      }

      // Check if instance with same hostname already exists for this user
      const existingInstance = await db.instance.findFirst({
        where: {
          user_id: data.user_id,
          hostname: data.hostname,
          state: { not: 'deleted' }
        }
      });

      if (existingInstance) {
        throw new ConflictError("Instance with this hostname already exists for this user");
      }

      // Get available PVE node
      const availableNode = await db.pve_node.findFirst({
        where: { 
          status: 'online',
          deleted_at: null 
        }
      });

      if (!availableNode) {
        throw new BadRequestError("No available PVE nodes found");
      }

      // Handle semester - if not provided, try to get active semester, but don't require it
      let semesterId = data.semester_id;
      if (!semesterId) {
        const activeSemester = await db.semester.findFirst({
          where: {
            active: true,
            deleted_at: null
          },
          orderBy: { created_at: 'desc' }
        });
        semesterId = activeSemester?.id;
      }

      // Generate a unique VM ID (starting from 1000 for staff-created instances)
      const maxVmId = await db.instance.aggregate({
        _max: { vm_id: true }
      });
      const vmid = (maxVmId._max.vm_id || 1000) + 1;

      // Create the instance record in the database
      const instance = await db.instance.create({
        data: {
          user_id: data.user_id,
          title: data.title,
          hostname: data.hostname,
          description: data.description,
          type: data.type as any,
          course_id: data.course_id,
          semester_id: semesterId,
          template_id: data.template_id,
          cpus: data.cpus,
          memory: data.memory,
          disk: data.disk,
          state: 'active',
          status: 'pending',
          pve_node: availableNode.name,
          vm_id: vmid,
        }
      });

      // Get the created instance with relations
      const instanceWithRelations = await db.instance.findUnique({
        where: { id: instance.id },
        include: {
          user: true,
          course: true,
          template: true,
          semester: true
        }
      });

      // Send VM creation message to RabbitMQ queue (skip in test environment)
      if (process.env.NODE_ENV !== 'test') {
        try {
          const publisher = await getRabbitMQPublisher();
          
          const vmMessage = {
            type: 'vm.create' as const,
            data: {
              vmid: vmid,
              templateId: parseInt(template.vm_template_id),
              name: data.hostname,
              node: availableNode.name,
              config: {
                cores: data.cpus,
                memory: data.memory,
                diskSize: `${data.disk}G`,
                ciuser: user.name || 'user',
                cipassword: 'changeme123', // Default password - should be changed by user
              }
            },
            requestId: `staff-${instance.id}`, // Use staff prefix to distinguish from regular requests
            userId: data.user_id
          };

          await publisher.publishMessage(vmMessage);
          console.log(`VM creation message sent for staff-created instance ${instance.id}`);
        } catch (rabbitError) {
          console.error('Failed to send VM creation message:', rabbitError);
          // Don't fail the entire operation if RabbitMQ is down
          // The instance is created in the database and can be processed later
        }
      }

      if (!instanceWithRelations) {
        throw new BadRequestError("Failed to retrieve created instance");
      }

      return {
        id: instanceWithRelations.id,
        title: instanceWithRelations.title,
        hostname: instanceWithRelations.hostname,
        description: instanceWithRelations.description,
        type: instanceWithRelations.type,
        cpus: instanceWithRelations.cpus,
        memory: instanceWithRelations.memory,
        disk: instanceWithRelations.disk,
        status: instanceWithRelations.status,
        vmid: instanceWithRelations.vm_id,
        node: instanceWithRelations.pve_node,
        user: {
          id: instanceWithRelations.user.id,
          email: instanceWithRelations.user.email,
          name: instanceWithRelations.user.name
        },
        course: {
          id: instanceWithRelations.course.id,
          title: instanceWithRelations.course.course_title
        },
        template: {
          id: instanceWithRelations.template.id,
          os_name: instanceWithRelations.template.os_name
        },
        semester: instanceWithRelations.semester ? {
          id: instanceWithRelations.semester.id,
          name: instanceWithRelations.semester.name
        } : null,
        created_at: instanceWithRelations.created_at
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Instance with this hostname already exists");
        }
        if (error.code === "P2003") {
          throw new BadRequestError("Invalid foreign key reference");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create instance");
    }
  }

  /**
   * Get available templates for instance creation
   */
  public static async getAvailableTemplates() {
    try {
      const templates = await db.instance_template.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          os_name: true,
          vm_type: true,
          based_size: true,
          host: {
            select: {
              name: true,
              status: true
            }
          }
        },
        orderBy: { os_name: 'asc' }
      });

      return templates.map(template => ({
        id: template.id,
        os_name: template.os_name,
        vm_type: template.vm_type,
        based_size: template.based_size,
        host_name: template.host.name,
        host_status: template.host.status
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch templates");
    }
  }

  /**
   * Get available courses for instance creation
   */
  public static async getAvailableCourses() {
    try {
      const courses = await db.instance_course.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true
        },
        orderBy: { course_title: 'asc' }
      });

      return courses.map(course => ({
        id: course.id,
        course_id: course.course_id,
        course_title: course.course_title,
        main_staff: course.main_staff,
        assistant_staff_1: course.assistant_staff_1,
        assistant_staff_2: course.assistant_staff_2,
        assistant_staff_3: course.assistant_staff_3
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch courses");
    }
  }

  /**
   * Get available semesters for instance creation
   */
  public static async getAvailableSemesters() {
    try {
      const semesters = await db.semester.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true
        },
        orderBy: { created_at: 'desc' }
      });

      return semesters.map(semester => ({
        id: semester.id,
        name: semester.name,
        start_at: semester.start_at,
        end_at: semester.end_at,
        active: semester.active
      }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch semesters");
    }
  }
}
