import { db } from "@momoi/libs/db";
import { SamesterManagement } from "core/src/modules/staff/samester_management";

export const samester_management = new SamesterManagement(db);
