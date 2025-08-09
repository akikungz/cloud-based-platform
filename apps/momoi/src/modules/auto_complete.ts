import { db } from "@momoi/libs/db";
import { AutoComplete } from "core/src/modules/shared/auto_complete";

export const auto_complete = new AutoComplete(db);
