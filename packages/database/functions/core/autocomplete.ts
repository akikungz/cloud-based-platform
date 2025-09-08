import type { PrismaDB } from "database";

export const get_staff = async (db: PrismaDB) => {
  return db.staff_list.findMany();
}

export const get_course = async (db: PrismaDB) => {
  // Prisma schema does not define relations to user for staff fields,
  // so we return course info only. Names can be joined upstream if needed.
  const courses = await db.instance_course.findMany({
    select: {
      id: true,
      course_id: true,
      course_title: true,
      main_staff: true,
      assistant_staff_1: true,
      assistant_staff_2: true,
      assistant_staff_3: true,
    },
  });

  return courses.map((c) => ({
    id: c.id,
    code: c.course_id,
    name: c.course_title,
    main_staff: String(c.main_staff ?? ""),
    assistant_staff_1: String(c.assistant_staff_1 ?? ""),
    assistant_staff_2: String(c.assistant_staff_2 ?? ""),
    assistant_staff_3: String(c.assistant_staff_3 ?? ""),
  }));
}

export const get_template = async (db: PrismaDB) => {
  return db.instance_template.findMany();
}