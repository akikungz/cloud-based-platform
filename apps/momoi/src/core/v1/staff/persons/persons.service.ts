import { db } from "@momoi/libs/db";
import { BadRequestError, NotFoundError, ConflictError } from "@momoi/shared/errors";
import { Prisma } from "database/generated/prisma-client/client";

// import { union } from "utils/functions/objects";

export class PersonsService {

  static async getPersons(skip?: number, take?: number) {
    try {
      // Get all staff emails from staff_list table
      const staffEmails = await db.staff_list.findMany({ 
        select: { id: true, email: true, created_at: true, updated_at: true } 
      });

      // Get users who have logged in and are in staff_list
      const loggedInUsers = await db.user.findMany({
        where: { email: { in: staffEmails.map(e => e.email) } },
        select: { id: true, email: true, name: true }
      });

      // Create a map of logged in users for quick lookup
      const loggedInUserMap = new Map(loggedInUsers.map(user => [user.email, user]));

      // Combine both logged in and pending staff members
      const allPersons = staffEmails.map(staffEmail => {
        const loggedInUser = loggedInUserMap.get(staffEmail.email);
        
        if (loggedInUser) {
          // User has logged in - return full user data
          return {
            id: loggedInUser.id,
            email: loggedInUser.email,
            name: loggedInUser.name,
            staff_id: staffEmail.id,
            created_at: staffEmail.created_at,
            updated_at: staffEmail.updated_at,
            status: 'active' as const
          };
        } else {
          // User hasn't logged in yet - return pending status
          return {
            id: null,
            email: staffEmail.email,
            name: null,
            staff_id: staffEmail.id,
            created_at: staffEmail.created_at,
            updated_at: staffEmail.updated_at,
            status: 'pending' as const
          };
        }
      });

      // Apply pagination
      const startIndex = skip || 0;
      const endIndex = startIndex + (take || 50);
      return allPersons.slice(startIndex, endIndex);
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
      const person = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
      if (!person) {
        throw new NotFoundError("Person not found");
      }

      const staff = await db.staff_list.findUnique({ where: { email }, select: { id: true } });
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
      const existingPerson = await db.staff_list.findUnique({
        where: { email }
      });

      if (existingPerson) {
        throw new ConflictError("Person with this email already exists");
      }

      return await db.staff_list.create({ data: { email } });
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
      const existingPerson = await db.staff_list.findUnique({
        where: { email }
      });

      if (!existingPerson) {
        throw new NotFoundError("Person not found");
      }

      return await db.staff_list.delete({ where: { email } });
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