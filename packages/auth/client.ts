import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";

import type { Auth } from "auth";

export const authClient = (url: string) =>
	createAuthClient({
		baseURL: url,
		fetchOptions: {
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			},
		},
		plugins: [customSessionClient<Auth>()],
	});

export const customSession = customSessionClient<Auth>();
