import type { PgTableWithColumns } from "drizzle-orm/pg-core";

import { mock_db } from "database";
import { create_callback } from "utils/functions/callback";

import * as better_auth from "database/schema/auth/better-auth";
import * as user_auth from "database/schema/auth/user";
import * as instances from "database/schema/core/instances";
import * as network from "database/schema/core/network";
import * as samester from "database/schema/core/samester";

export const resetAll = async () => {
  const allSchemas = [
    ...Object.values(better_auth),
    ...Object.values(user_auth),
    ...Object.values(instances),
    ...Object.values(network),
    ...Object.values(samester),
  ].filter((schema) =>
    schema != null && typeof schema === 'object' && 'getSQL' in schema && typeof schema.getSQL === 'function'
  ) as PgTableWithColumns<any>[];

  return create_callback(async () => {
    await Promise.all(allSchemas.map((s) => mock_db.delete(s).execute()));
  });
}

export const resetAfterEach = () => {
  const allSchemas = [
    ...Object.values(better_auth),
    ...Object.values(user_auth),
    ...Object.values(instances),
    ...Object.values(network),
    ...Object.values(samester),
  ].filter((schema) =>
    schema != null && typeof schema === 'object' && 'getSQL' in schema && typeof schema.getSQL === 'function'
  ) as PgTableWithColumns<any>[];

  return Promise.all(allSchemas.map((s) => mock_db.delete(s).execute()));
}
