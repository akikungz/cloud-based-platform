"use client";
import { treaty } from "@elysiajs/eden";
import { env } from "./env";

import { client, type Server } from "momoi/client";

// export const momoi_client = treaty<Server>(env.API_URL, {
//   fetch: {
//     credentials: "include",
//   }
// });

export const momoi_client = client(env.API_URL);

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
