import { db as dbModule } from "db";
import env from "./env";

export const db = dbModule(env.DATABASE_URL);
