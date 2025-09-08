import type { PrismaDB } from "database";

export const check_staff = async (db: PrismaDB, id: string) => {
  const count = await db.staff_list.count({ where: { user_id: id } });
  return count === 1;
}
