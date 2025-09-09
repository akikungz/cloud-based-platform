import { db } from "@momoi/libs/db";

export class InstanceService {
  private static db = db;

  public static async getInstances(userId: string) {
    const results = await this.db.instance.findMany({
      where: { user_id: userId, NOT: { state: "deleted" } },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        cpus: true,
        memory: true,
        disk: true,
        ip_address: true,
        samester: { select: { name: true } }
      }
    });
    return results.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      samester: r.samester?.name ?? null,
      cpus: r.cpus,
      memory: r.memory,
      disk: r.disk,
      ip_address: r.ip_address
    }));
  }

  public static async getInstanceById(userId: string, id: number) {
    const result = await this.db.instance.findFirst({
      where: { user_id: userId, id, NOT: { state: "deleted" } },
      include: { samester: true }
    });
    return result ?? null;
  }

  public static async deleteInstance(userId: string, id: number) {
    const existing = await this.db.instance.findFirst({
      where: { user_id: userId, id, NOT: { OR: [{ state: "deleted" }, { state: "archived" }] } }
    });
    if (!existing) {
      throw new Error("Instance not found or already deleted/archived");
    }
    return this.db.instance.update({
      where: { id },
      data: { state: "deleted" }
    });
  }
}