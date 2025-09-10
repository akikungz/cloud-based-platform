import type { PrismaClient } from "database/generated/prisma-client";

type Where = any;

const matchWhere = (row: any, where?: Where): boolean => {
  if (!where) return true;
  // basic equality
  for (const key of Object.keys(where)) {
    if (key === "NOT") {
      const cond = where.NOT;
      if (Array.isArray(cond)) {
        if (cond.some((c) => matchWhere(row, c))) return false;
      } else if (matchWhere(row, cond)) return false;
      continue;
    }
    if (key === "OR") {
      const arr = where.OR as any[];
      if (!arr.some((c) => matchWhere(row, c))) return false;
      continue;
    }
    const cond = where[key];
    if (cond && typeof cond === "object" && "in" in cond) {
      if (!cond.in.includes(row[key])) return false;
    } else if (row[key] !== cond) {
      return false;
    }
  }
  return true;
};

const createModel = (name: string) => {
  const store: any[] = [];
  const ensureId = (data: any) => {
    if (data.id == null) {
      const max = store.reduce((m, r) => (typeof r.id === "number" && r.id > m ? r.id : m), 0);
      data.id = max + 1;
    }
    return data;
  };
  return {
    _name: name,
    _data: store,
    deleteMany: async (args?: { where?: Where }) => {
      if (!args?.where) {
        const count = store.length;
        store.length = 0;
        return { count };
      }
      const keep = store.filter((r) => !matchWhere(r, args.where));
      const count = store.length - keep.length;
      store.length = 0;
      store.push(...keep);
      return { count };
    },
    create: async ({ data }: { data: any }) => {
      const row = ensureId({ ...data });
      store.push(row);
      return row;
    },
    createMany: async ({ data }: { data: any[]; skipDuplicates?: boolean }) => {
      for (const d of data) store.push(ensureId({ ...d }));
      return { count: data.length };
    },
    findMany: async (args?: { where?: Where; select?: any; include?: any }) => {
      return store.filter((r) => matchWhere(r, args?.where));
    },
    findFirst: async (args?: { where?: Where; include?: any }) => {
      return store.find((r) => matchWhere(r, args?.where)) ?? null;
    },
    findUnique: async (args?: { where?: Where; include?: any }) => {
      return store.find((r) => matchWhere(r, args?.where)) ?? null;
    },
    update: async ({ where, data }: { where: { id: number | string }; data: any }) => {
      const idx = store.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error(`${name} not found`);
      store[idx] = { ...store[idx], ...data };
      return store[idx];
    },
    count: async (args?: { where?: Where }) => {
      return store.filter((r) => matchWhere(r, args?.where)).length;
    },
    delete: async (args?: { where?: Where }) => {
      const idx = store.findIndex((r) => matchWhere(r, args?.where));
      if (idx === -1) throw new Error(`${name} not found`);
      return store.splice(idx, 1)[0];
    }
  };
};

export const createMockPrisma = () => {
  return {
    user: createModel("user"),
    staff_list: createModel("staff_list"),
    instance_course: createModel("instance_course"),
    pve_node: createModel("pve_node"),
    instance_template: createModel("instance_template"),
    network: createModel("network"),
    ip_address: createModel("ip_address"),
    semester: createModel("semester"),
    instance: createModel("instance"),
    instance_request: createModel("instance_request"),
    instance_request_extends: createModel("instance_request_extends"),
  } as any; // Keep as any for mock simplicity
};


