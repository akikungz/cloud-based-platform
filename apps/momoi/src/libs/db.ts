import { db as db_module } from "database";

import { env } from "@momoi/libs/env";

export const db = db_module(env.DATABASE_URL);
