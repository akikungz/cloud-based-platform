import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";

import type { Auth } from "auth";

/**
 * Creates an authentication client for the application.
 * This client is configured to communicate with the specified base URL
 * and includes custom session handling.
 * @param url - The base URL for the authentication service.
 * @returns An instance of the authentication client.
 */
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

/**
 * Creates a custom session client for the authentication service.
 * This client is used to manage user sessions and authentication state.
 * @returns An instance of the custom session client.
 */
export const customSession = customSessionClient<Auth>();
