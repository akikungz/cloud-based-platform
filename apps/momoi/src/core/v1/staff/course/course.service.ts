import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

export class CourseService {
  static async getCourses(skip?: number, take?: number) {
    try {
      return await db.instance_course.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              instance_request: true,
              instance: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: skip || 0,
        take: take || 50
      });
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

  static async getCourseById(id: number) {
    try {
      const course = await db.instance_course.findUnique({
        where: { id, deleted_at: null },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true,
          instance_request: {
            select: {
              id: true,
              title: true,
              state: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { created_at: 'desc' }
          },
          instance: {
            select: {
              id: true,
              title: true,
              state: true,
              status: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!course) {
        throw new NotFoundError("Course not found");
      }
      return course;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch course");
    }
  }

  static async getCourseByCourseId(courseId: string) {
    try {
      const course = await db.instance_course.findFirst({
        where: { course_id: courseId, deleted_at: null },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!course) {
        throw new NotFoundError("Course not found");
      }
      return course;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch course");
    }
  }

  static async createCourse(data: {
    course_id: string;
    course_title: string;
    main_staff: number;
    assistant_staff_1?: number;
    assistant_staff_2?: number;
    assistant_staff_3?: number;
  }) {
    try {
      // Check if course_id already exists
      const existingCourse = await db.instance_course.findFirst({
        where: { course_id: data.course_id }
      });

      if (existingCourse && !existingCourse.deleted_at) {
        throw new ConflictError("Course with this ID already exists");
      }

      return await db.instance_course.create({
        data: {
          course_id: data.course_id,
          course_title: data.course_title,
          main_staff: data.main_staff,
          assistant_staff_1: data.assistant_staff_1,
          assistant_staff_2: data.assistant_staff_2,
          assistant_staff_3: data.assistant_staff_3
        },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true
        }
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Course with this ID already exists");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create course");
    }
  }

  static async updateCourse(id: number, data: {
    course_id?: string;
    course_title?: string;
    main_staff?: number;
    assistant_staff_1?: number;
    assistant_staff_2?: number;
    assistant_staff_3?: number;
  }) {
    try {
      // Check if course exists
      const existingCourse = await db.instance_course.findUnique({
        where: { id, deleted_at: null }
      });

      if (!existingCourse) {
        throw new NotFoundError("Course not found");
      }

      // Check if course_id is being changed and if it already exists
      if (data.course_id && data.course_id !== existingCourse.course_id) {
        const courseIdExists = await db.instance_course.findFirst({
          where: { course_id: data.course_id }
        });

        if (courseIdExists && !courseIdExists.deleted_at && courseIdExists.id !== id) {
          throw new ConflictError("Course with this ID already exists");
        }
      }

      return await db.instance_course.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Course not found");
        }
        if (error.code === "P2002") {
          throw new ConflictError("Course with this ID already exists");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to update course");
    }
  }

  static async deleteCourse(id: number) {
    try {
      // Check if course exists
      const existingCourse = await db.instance_course.findUnique({
        where: { id, deleted_at: null }
      });

      if (!existingCourse) {
        throw new NotFoundError("Course not found");
      }

      // Check if course has associated instances or requests
      const [instanceCount, requestCount] = await Promise.all([
        db.instance.count({
          where: { course_id: id }
        }),
        db.instance_request.count({
          where: { course_id: id }
        })
      ]);

      if (instanceCount > 0 || requestCount > 0) {
        throw new ConflictError("Cannot delete course with associated instances or requests");
      }

      // Soft delete the course
      return await db.instance_course.update({
        where: { id },
        data: { deleted_at: new Date() },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Course not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to delete course");
    }
  }

  static async getCoursesByStaff(staffId: number) {
    try {
      return await db.instance_course.findMany({
        where: {
          deleted_at: null,
          OR: [
            { main_staff: staffId },
            { assistant_staff_1: staffId },
            { assistant_staff_2: staffId },
            { assistant_staff_3: staffId }
          ]
        },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              instance_request: true,
              instance: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch courses for staff");
    }
  }

  static async searchCourses(query: string, skip?: number, take?: number) {
    try {
      return await db.instance_course.findMany({
        where: {
          deleted_at: null,
          OR: [
            { course_id: { contains: query, mode: 'insensitive' } },
            { course_title: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          course_id: true,
          course_title: true,
          main_staff: true,
          assistant_staff_1: true,
          assistant_staff_2: true,
          assistant_staff_3: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              instance_request: true,
              instance: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: skip || 0,
        take: take || 20
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to search courses");
    }
  }

  static async getCourseStats(id: number) {
    try {
      const course = await db.instance_course.findUnique({
        where: { id, deleted_at: null }
      });

      if (!course) {
        throw new NotFoundError("Course not found");
      }

      const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
        db.instance_request.count({
          where: { course_id: id }
        }),
        db.instance_request.count({
          where: { course_id: id, state: 'pending' }
        }),
        db.instance_request.count({
          where: { course_id: id, state: 'approved' }
        }),
        db.instance_request.count({
          where: { course_id: id, state: 'rejected' }
        })
      ]);

      const [totalInstances, activeInstances, runningInstances, stoppedInstances] = await Promise.all([
        db.instance.count({
          where: { course_id: id }
        }),
        db.instance.count({
          where: { course_id: id, state: 'active' }
        }),
        db.instance.count({
          where: { course_id: id, status: 'running' }
        }),
        db.instance.count({
          where: { course_id: id, status: 'stopped' }
        })
      ]);

      return {
        course: {
          id: course.id,
          course_id: course.course_id,
          course_title: course.course_title
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests
        },
        instances: {
          total: totalInstances,
          active: activeInstances,
          running: runningInstances,
          stopped: stoppedInstances
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch course statistics");
    }
  }
}
