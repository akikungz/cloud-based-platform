"use client";
import { env } from "@midori/libs/env";
import { customSession } from "auth/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${env.API_URL}/api/auth`,
	plugins: [customSession],
});

export const { useSession } = authClient;
