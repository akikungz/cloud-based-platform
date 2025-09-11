"use client";
import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";

import { env } from "@midori/libs/env";

import { type AuthServer } from "auth/server";
import { auth as authClient } from "auth/client";

export const auth = createAuthClient({
  baseURL: `${env.API_URL}/api/auth`,
  plugins: [customSessionClient<AuthServer>()],
});
// export const auth = authClient(`${env.API_URL}/api/auth`);

export const { useSession } = auth; // Export types only
