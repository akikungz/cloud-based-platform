import { client, type Client } from "momoi/client";
import { env } from "./env";

export const momoi_client: Client = client(env.FRONTEND_BASE_URL);