import type { PrismaDB } from "database";
import { create_callback } from "utils/functions/callback";

export const resetAll = async (db: PrismaDB) => {
  return create_callback(async () => {
    await db.verification.deleteMany();
    await db.account.deleteMany();
    await db.session.deleteMany();
    await db.staff_list.deleteMany();
    await db.user_public_key.deleteMany();

    await db.ip_address.deleteMany();
    await db.network.deleteMany();

    await db.instance_request_extends.deleteMany();
    await db.instance.deleteMany();
    await db.instance_request.deleteMany();
    await db.instance_template.deleteMany();
    await db.instance_course.deleteMany();

    await db.pve_node.deleteMany();
    await db.samester.deleteMany();
    await db.user.deleteMany();
  });
}

export const resetAfterEach = (db: PrismaDB) => {
  return Promise.all([
    db.verification.deleteMany(),
    db.account.deleteMany(),
    db.session.deleteMany(),
    db.staff_list.deleteMany(),
    db.user_public_key.deleteMany(),

    db.ip_address.deleteMany(),
    db.network.deleteMany(),

    db.instance_request_extends.deleteMany(),
    db.instance.deleteMany(),
    db.instance_request.deleteMany(),
    db.instance_template.deleteMany(),
    db.instance_course.deleteMany(),

    db.pve_node.deleteMany(),
    db.samester.deleteMany(),
    db.user.deleteMany(),
  ]);
}
