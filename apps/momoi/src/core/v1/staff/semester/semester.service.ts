import { db } from "@momoi/libs/db";

export class SemesterService {
  private static db = db;

  static async getSemesters() {
    return this.db.semester.findMany({
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
      orderBy: { created_at: 'desc' }
    });
  }

  static async getSemesterById(id: number) {
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

    if (!semester) return null;
    return semester;
  }

  static async createSemester(data: {
    name: string;
    start_at: Date;
    end_at: Date;
    active?: boolean;
  }) {
    // Check if semester name already exists
    const existingSemester = await this.db.semester.findUnique({
      where: { name: data.name }
    });

    if (existingSemester && !existingSemester.deleted_at) {
      throw new Error("Semester with this name already exists");
    }

    // If creating an active semester, deactivate all other semesters
    if (data.active) {
      await this.db.semester.updateMany({
        where: { active: true },
        data: { active: false }
      });
    }

    return this.db.semester.create({
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
  }

  static async updateSemester(id: number, data: {
    name?: string;
    start_at?: Date;
    end_at?: Date;
    active?: boolean;
  }) {
    // Check if semester exists
    const existingSemester = await this.db.semester.findUnique({
      where: { id, deleted_at: null }
    });

    if (!existingSemester) {
      throw new Error("Semester not found");
    }

    // Check if name is being changed and if it already exists
    if (data.name && data.name !== existingSemester.name) {
      const nameExists = await this.db.semester.findUnique({
        where: { name: data.name }
      });

      if (nameExists && !nameExists.deleted_at && nameExists.id !== id) {
        throw new Error("Semester with this name already exists");
      }
    }

    // If activating this semester, deactivate all other semesters
    if (data.active === true) {
      await this.db.semester.updateMany({
        where: { active: true, id: { not: id } },
        data: { active: false }
      });
    }

    return this.db.semester.update({
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
  }

  static async deleteSemester(id: number) {
    // Check if semester exists
    const existingSemester = await this.db.semester.findUnique({
      where: { id, deleted_at: null }
    });

    if (!existingSemester) {
      throw new Error("Semester not found");
    }

    // Check if semester has associated instances
    const instanceCount = await this.db.instance.count({
      where: { semester_id: id }
    });

    if (instanceCount > 0) {
      throw new Error("Cannot delete semester with associated instances");
    }

    // Soft delete the semester
    return this.db.semester.update({
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
  }

  static async getActiveSemester() {
    return this.db.semester.findFirst({
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
  }

  static async activateSemester(id: number) {
    // Check if semester exists
    const existingSemester = await this.db.semester.findUnique({
      where: { id, deleted_at: null }
    });

    if (!existingSemester) {
      throw new Error("Semester not found");
    }

    // Deactivate all other semesters
    await this.db.semester.updateMany({
      where: { active: true },
      data: { active: false }
    });

    // Activate the specified semester
    return this.db.semester.update({
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
  }
}
