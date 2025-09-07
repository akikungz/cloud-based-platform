import { Elysia } from "elysia";

import { auth_controller } from "@momoi/core/auth/auth.controller";

export const api = new Elysia({ prefix: "/api" }).use(auth_controller);
