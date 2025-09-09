import { db } from "@momoi/libs/db";

// import { union } from "utils/functions/objects";

export class PersonsService {
  private static db = db;

  static async getPersons() {
    const emails = await this.db.staff_list.findMany({ select: { id: true, email: true } });

    const persons = await this.db.user.findMany({
      where: { email: { in: emails.map(e => e.email) } },
      select: { id: true, email: true, name: true }
    });

    return persons.map(p => ({
      ...p,
      staff_id: emails.find(e => e.email === p.email)?.id || null
    })).filter(p => p.staff_id !== null);
  }

  static async getPersonsByEmail(email: string) {
    const person = await this.db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
    if (!person) return null;

    const staff = await this.db.staff_list.findUnique({ where: { email }, select: { id: true } });
    if (!staff) return null;

    return { ...person, staff_id: staff.id };
  }

  static async createPerson(email: string) {
    return this.db.staff_list.create({ data: { email } });
  }

  static async deletePerson(email: string) {
    try {
      return await this.db.staff_list.delete({ where: { email } });
    } catch (error) {
      return null;
    }
  }
}