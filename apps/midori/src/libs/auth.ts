"use server";
import { env } from "@midori/libs/env";
import { authClient } from "auth";

export const auth = authClient(`${env.API_URL}/api/auth`);
