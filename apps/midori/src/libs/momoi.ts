"use client";
import { treaty } from "@elysiajs/eden";
import { env } from "./env";

import { Server } from "momoi/client";

export const momoi_client = treaty<Server>(env.API_URL, {
  fetch: {
    credentials: "include",
  }
});

// Type definitions for API responses
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  totalPages: number;
  data: T[];
}
