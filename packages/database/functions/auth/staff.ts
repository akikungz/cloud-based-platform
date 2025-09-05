import { eq } from "drizzle-orm";

import { type DB } from "database";
import { staff_list } from "database/schema/auth/user";

export const check_staff = async (db: DB, id: string) => {
  const staff = await db
    .select()
    .from(staff_list)
    .where(eq(staff_list.user_id, id))

  if (staff.length == 1) return true;
  return false;
}
