"use client";
import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import { type AuthServer } from "./server";

export const auth = (url: string) =>
  createAuthClient({
    baseURL: url,
    fetchOptions: {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    },
    plugins: [
      customSessionClient<AuthServer>(),
    ]
  });

export type AuthClient = ReturnType<typeof auth>;
