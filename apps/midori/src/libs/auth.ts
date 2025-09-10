"use client";
import { env } from "@midori/libs/env";
import { auth as base_auth } from "auth/client";

export const auth = base_auth(env.FRONTEND_BASE_URL);