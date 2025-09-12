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
    } else if (cond && typeof cond === "object" && "not" in cond) {
      // Handle not conditions - if cond.not is specified, row[key] should not equal cond.not
      if (row[key] === cond.not) return false;
    } else if (cond === null) {
      // Handle null conditions - if cond is null, row[key] should also be null or undefined
      if (row[key] !== null && row[key] !== undefined) return false;
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
    // Add timestamp fields if not present
    const now = new Date();
    if (data.created_at == null) {
      data.created_at = now;
    }
    if (data.updated_at == null) {
      data.updated_at = now;
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
    findMany: async (args?: { where?: Where; select?: any; include?: any; orderBy?: any }) => {
      let filtered = store.filter((r) => matchWhere(r, args?.where));
      
      // Handle orderBy
      if (args?.orderBy) {
        filtered.sort((a, b) => {
          for (const [field, direction] of Object.entries(args.orderBy)) {
            const aVal = a[field];
            const bVal = b[field];
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      if (args?.include) {
        return filtered.map(item => {
          const result = { ...item };
          for (const [relationName, includeConfig] of Object.entries(args.include)) {
            if (includeConfig === true) {
              // Simple include - just add the relation data
              // Map relation names to actual model names
              const modelName = relationName === 'course' ? 'instance_course' : 
                              relationName === 'template' ? 'instance_template' : 
                              relationName;
              result[relationName] = (global as any).globalMockDb?.[modelName]?._data?.find((relatedItem: any) => {
                // Try to find related item by common field
                // For instance_template -> host relation, match vm_template_host with pve_node.name
                if (name === 'instance_template' && relationName === 'host') {
                  return relatedItem.name === item.vm_template_host;
                }
                // For instance -> user relation, match user_id with user.id
                if (name === 'instance' && relationName === 'user') {
                  return relatedItem.id === item.user_id;
                }
                // For instance -> course relation, match course_id with instance_course.id
                if (name === 'instance' && relationName === 'course') {
                  return relatedItem.id === item.course_id;
                }
                // For instance -> template relation, match template_id with instance_template.id
                if (name === 'instance' && relationName === 'template') {
                  return relatedItem.id === item.template_id;
                }
                // For instance -> semester relation, match semester_id with semester.id
                if (name === 'instance' && relationName === 'semester') {
                  return relatedItem.id === item.semester_id;
                }
                return false;
              }) || null;
            }
          }
          return result;
        });
      }
      
      if (args?.select) {
        return filtered.map(item => {
          const result: any = {};
          for (const [field, value] of Object.entries(args.select)) {
            if (value === true) {
              result[field] = item[field];
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested select (like host: { select: { name: true } })
              // Map relation names to actual model names
              const modelName = field === 'host' ? 'pve_node' : field;
              const relatedItem = (global as any).globalMockDb?.[modelName]?._data?.find((related: any) => {
                if (name === 'instance_template' && field === 'host') {
                  return related.name === item.vm_template_host;
                }
                return false;
              });
              
              if (relatedItem) {
                // Check if this is a nested select structure
                if ('select' in value && value.select) {
                  result[field] = {};
                  for (const [nestedField, nestedValue] of Object.entries(value.select)) {
                    if (nestedValue === true) {
                      result[field][nestedField] = relatedItem[nestedField];
                    }
                  }
                } else {
                  // Direct field mapping
                  result[field] = {};
                  for (const [nestedField, nestedValue] of Object.entries(value)) {
                    if (nestedValue === true) {
                      result[field][nestedField] = relatedItem[nestedField];
                    }
                  }
                }
              } else {
                result[field] = null;
              }
            }
          }
          return result;
        });
      }
      
      return filtered;
    },
    findFirst: async (args?: { where?: Where; include?: any }) => {
      const found = store.find((r) => matchWhere(r, args?.where));
      if (!found) return null;
      
      if (args?.include) {
        const result = { ...found };
        for (const [relationName, includeConfig] of Object.entries(args.include)) {
          if (includeConfig === true) {
            // Map relation names to actual model names
            const modelName = relationName === 'course' ? 'instance_course' : 
                            relationName === 'template' ? 'instance_template' : 
                            relationName;
            result[relationName] = (global as any).globalMockDb?.[modelName]?._data?.find((relatedItem: any) => {
              if (name === 'instance_template' && relationName === 'host') {
                return relatedItem.name === found.vm_template_host;
              }
              // For instance -> user relation, match user_id with user.id
              if (name === 'instance' && relationName === 'user') {
                return relatedItem.id === found.user_id;
              }
              // For instance -> course relation, match course_id with instance_course.id
              if (name === 'instance' && relationName === 'course') {
                return relatedItem.id === found.course_id;
              }
              // For instance -> template relation, match template_id with instance_template.id
              if (name === 'instance' && relationName === 'template') {
                return relatedItem.id === found.template_id;
              }
              // For instance -> semester relation, match semester_id with semester.id
              if (name === 'instance' && relationName === 'semester') {
                return relatedItem.id === found.semester_id;
              }
              return false;
            }) || null;
          }
        }
        return result;
      }
      
      return found;
    },
    findUnique: async (args?: { where?: Where; include?: any; select?: any }) => {
      const found = store.find((r) => matchWhere(r, args?.where));
      if (!found) return null;
      
      if (args?.select) {
        const result: any = {};
        for (const [field, value] of Object.entries(args.select)) {
          if (value === true) {
            result[field] = found[field];
          } else if (typeof value === 'object' && value !== null) {
              // Handle nested select (like host: { select: { name: true } })
              // Map relation names to actual model names
              const modelName = field === 'host' ? 'pve_node' : field;
              const relatedItem = (global as any).globalMockDb?.[modelName]?._data?.find((related: any) => {
                if (name === 'instance_template' && field === 'host') {
                  return related.name === found.vm_template_host;
                }
                return false;
              });
            
            if (relatedItem) {
              result[field] = {};
              for (const [nestedField, nestedValue] of Object.entries(value as any)) {
                if (nestedValue === true) {
                  result[field][nestedField] = relatedItem[nestedField];
                }
              }
            } else {
              result[field] = null;
            }
          }
        }
        return result;
      }
      
      if (args?.include) {
        const result = { ...found };
        for (const [relationName, includeConfig] of Object.entries(args.include)) {
          if (includeConfig === true) {
            // Map relation names to actual model names
            const modelName = relationName === 'course' ? 'instance_course' : 
                            relationName === 'template' ? 'instance_template' : 
                            relationName;
            const relatedData = (global as any).globalMockDb?.[modelName]?._data;
            result[relationName] = relatedData?.find((relatedItem: any) => {
              if (name === 'instance_template' && relationName === 'host') {
                return relatedItem.name === found.vm_template_host;
              }
              // For instance -> user relation, match user_id with user.id
              if (name === 'instance' && relationName === 'user') {
                return relatedItem.id === found.user_id;
              }
              // For instance -> course relation, match course_id with instance_course.id
              if (name === 'instance' && relationName === 'course') {
                return relatedItem.id === found.course_id;
              }
              // For instance -> template relation, match template_id with instance_template.id
              if (name === 'instance' && relationName === 'template') {
                return relatedItem.id === found.template_id;
              }
              // For instance -> semester relation, match semester_id with semester.id
              if (name === 'instance' && relationName === 'semester') {
                return relatedItem.id === found.semester_id;
              }
              return false;
            }) || null;
          }
        }
        return result;
      }
      
      return found;
    },
    update: async ({ where, data }: { where: { id: number | string }; data: any }) => {
      const idx = store.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error(`${name} not found`);
      store[idx] = { ...store[idx], ...data, updated_at: new Date() };
      return store[idx];
    },
    updateMany: async ({ where, data }: { where?: Where; data: any }) => {
      const matchingIndices = store
        .map((r, idx) => matchWhere(r, where) ? idx : -1)
        .filter(idx => idx !== -1);
      
      matchingIndices.forEach(idx => {
        store[idx] = { ...store[idx], ...data, updated_at: new Date() };
      });
      
      return { count: matchingIndices.length };
    },
    count: async (args?: { where?: Where }) => {
      return store.filter((r) => matchWhere(r, args?.where)).length;
    },
    aggregate: async (args: { _max?: any; _min?: any; _avg?: any; _sum?: any; _count?: any; where?: any }) => {
      const filtered = store.filter((r) => matchWhere(r, args.where));
      const result: any = {};
      
      if (args._max) {
        result._max = {};
        for (const [field] of Object.entries(args._max)) {
          result._max[field] = filtered.reduce((max, item) => {
            const value = item[field];
            return value > max ? value : max;
          }, filtered.length > 0 ? filtered[0][field] : null);
        }
      }
      
      if (args._min) {
        result._min = {};
        for (const [field] of Object.entries(args._min)) {
          result._min[field] = filtered.reduce((min, item) => {
            const value = item[field];
            return value < min ? value : min;
          }, filtered.length > 0 ? filtered[0][field] : null);
        }
      }
      
      if (args._count) {
        result._count = filtered.length;
      }
      
      return result;
    },
    delete: async (args?: { where?: Where }) => {
      const idx = store.findIndex((r) => matchWhere(r, args?.where));
      if (idx === -1) throw new Error(`${name} not found`);
      return store.splice(idx, 1)[0];
    }
  };
};

export const createMockPrisma = () => {
  const mockDb = {
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
  
  // Make it globally accessible for relation resolution
  (global as any).globalMockDb = mockDb;
  
  return mockDb;
};


