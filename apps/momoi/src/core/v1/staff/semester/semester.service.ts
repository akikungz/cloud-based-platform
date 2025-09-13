import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

export class SemesterService {
  private static db = db;

  static async getSemesters(skip?: number, take?: number) {
    try {
      return await this.db.semester.findMany({
        where: { deleted_at: null },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
          created_at: true,
          updated_at: true
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

      throw new BadRequestError("Failed to fetch semesters");
    }
  }

  static async getSemesterById(id: number) {
    try {
      const semester = await this.db.semester.findUnique({
        where: { id, deleted_at: null },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!semester) {
        throw new NotFoundError("Semester not found");
      }
      return semester;
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

      throw new BadRequestError("Failed to fetch semester");
    }
  }

  static async createSemester(data: {
    name: string;
    start_at: Date;
    end_at: Date;
    active?: boolean;
  }) {
    try {
      // Check if semester name already exists
      const existingSemester = await this.db.semester.findUnique({
        where: { name: data.name }
      });

      if (existingSemester && !existingSemester.deleted_at) {
        throw new ConflictError("Semester with this name already exists");
      }

      // If creating an active semester, deactivate all other semesters
      if (data.active) {
        await this.db.semester.updateMany({
          where: { active: true },
          data: { active: false }
        });
      }

      return await this.db.semester.create({
        data: {
          name: data.name,
          start_at: data.start_at,
          end_at: data.end_at,
          active: data.active ?? false
        },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
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
          throw new ConflictError("Semester with this name already exists");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create semester");
    }
  }

  static async updateSemester(id: number, data: {
    name?: string;
    start_at?: Date;
    end_at?: Date;
    active?: boolean;
  }) {
    try {
      // Check if semester exists
      const existingSemester = await this.db.semester.findUnique({
        where: { id, deleted_at: null }
      });

      if (!existingSemester) {
        throw new NotFoundError("Semester not found");
      }

      // Check if name is being changed and if it already exists
      if (data.name && data.name !== existingSemester.name) {
        const nameExists = await this.db.semester.findUnique({
          where: { name: data.name }
        });

        if (nameExists && !nameExists.deleted_at && nameExists.id !== id) {
          throw new ConflictError("Semester with this name already exists");
        }
      }

      // If activating this semester, deactivate all other semesters
      if (data.active === true) {
        await this.db.semester.updateMany({
          where: { active: true, id: { not: id } },
          data: { active: false }
        });
      }

      return await this.db.semester.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
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
          throw new NotFoundError("Semester not found");
        }
        if (error.code === "P2002") {
          throw new ConflictError("Semester with this name already exists");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to update semester");
    }
  }

  static async deleteSemester(id: number) {
    try {
      // Check if semester exists
      const existingSemester = await this.db.semester.findUnique({
        where: { id, deleted_at: null }
      });

      if (!existingSemester) {
        throw new NotFoundError("Semester not found");
      }

      // Check if semester has associated instances
      const instanceCount = await this.db.instance.count({
        where: { semester_id: id }
      });

      if (instanceCount > 0) {
        throw new ConflictError("Cannot delete semester with associated instances");
      }

      // Soft delete the semester
      return await this.db.semester.update({
        where: { id },
        data: { deleted_at: new Date() },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
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
          throw new NotFoundError("Semester not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to delete semester");
    }
  }

  static async getActiveSemester() {
    try {
      const activeSemester = await this.db.semester.findFirst({
        where: { active: true, deleted_at: null },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
          created_at: true,
          updated_at: true
        }
      });

      // Return null instead of throwing error when no active semester found
      return activeSemester;
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

      throw new BadRequestError("Failed to fetch active semester");
    }
  }

  static async getNextSemester(dbInstance?: any) {
    try {
      const now = new Date();
      const dbToUse = dbInstance || this.db;
      
      // Find the next semester that starts after the current date
      // Use findMany and filter manually since the mock database doesn't handle complex where clauses well
      const allSemesters = await dbToUse.semester.findMany({
        where: { 
          deleted_at: null 
        },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { start_at: 'asc' }
      });
      
      // Find the first semester that starts after the current date
      const nextSemester = allSemesters.find((semester: { start_at: Date }) => semester.start_at > now) || null;
      
      // Return null if no next semester found
      return nextSemester;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch next semester");
    }
  }

  static async activateSemester(id: number) {
    try {
      // Check if semester exists
      const existingSemester = await this.db.semester.findUnique({
        where: { id, deleted_at: null }
      });

      if (!existingSemester) {
        throw new NotFoundError("Semester not found");
      }

      // Deactivate all other semesters
      await this.db.semester.updateMany({
        where: { active: true },
        data: { active: false }
      });

      // Activate the specified semester
      return await this.db.semester.update({
        where: { id },
        data: { 
          active: true,
          updated_at: new Date()
        },
        select: {
          id: true,
          name: true,
          start_at: true,
          end_at: true,
          active: true,
          created_at: true,
          updated_at: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Semester not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to activate semester");
    }
  }
}

