import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

// import { union } from "utils/functions/objects";

export class PersonsService {
  private static db = db;

  static async getPersons() {
    try {
      const emails = await this.db.staff_list.findMany({ select: { id: true, email: true, created_at: true, updated_at: true } });

      const persons = await this.db.user.findMany({
        where: { email: { in: emails.map(e => e.email) } },
        select: { id: true, email: true, name: true }
      });

      return persons.map(p => {
        const staffEmail = emails.find(e => e.email === p.email);
        return {
          ...p,
          staff_id: staffEmail!.id,
          created_at: staffEmail!.created_at,
          updated_at: staffEmail!.updated_at,
        };
      }).filter(p => p.staff_id !== undefined);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to fetch persons");
    }
  }

  static async getPersonsByEmail(email: string) {
    try {
      const person = await this.db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
      if (!person) {
        throw new NotFoundError("Person not found");
      }

      const staff = await this.db.staff_list.findUnique({ where: { email }, select: { id: true } });
      if (!staff) {
        throw new NotFoundError("Person is not a staff member");
      }

      return { ...person, staff_id: staff.id };
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

      throw new BadRequestError("Failed to fetch person by email");
    }
  }

  static async createPerson(email: string) {
    try {
      // Check if person already exists
      const existingPerson = await this.db.staff_list.findUnique({
        where: { email }
      });

      if (existingPerson) {
        throw new ConflictError("Person with this email already exists");
      }

      return await this.db.staff_list.create({ data: { email } });
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictError("Person with this email already exists");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to create person");
    }
  }

  static async deletePerson(email: string) {
    try {
      // Check if person exists
      const existingPerson = await this.db.staff_list.findUnique({
        where: { email }
      });

      if (!existingPerson) {
        throw new NotFoundError("Person not found");
      }

      return await this.db.staff_list.delete({ where: { email } });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Person not found");
        }
        throw new BadRequestError(error.message);
      }

      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }

      throw new BadRequestError("Failed to delete person");
    }
  }
}