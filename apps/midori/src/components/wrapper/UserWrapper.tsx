"use client";
import { UserContext, UserProvider } from "@midori/contexts/user";
import { auth } from "@midori/libs/auth";
import { redirect } from "next/navigation";
import { useContext, useEffect } from "react";
import { Role } from "auth/utils/role";

import { FullScreenLoading } from "./Loading";

export const UserWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<UserProvider>
			<UserQuery>{children}</UserQuery>
		</UserProvider>
	);
};

const UserQuery: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const userContext = useContext(UserContext);
	const { data: session, isPending, error } = auth.useSession();

	useEffect(() => {
		const _handleSignIn = () => {
			auth.signIn.social({
				provider: "google",
				callbackURL: "/dashboard",
			});
		};

		if (isPending) {
			console.log("Loading session...");
			userContext.setIsPending(true);
		} else {
			userContext.setIsPending(false);

			if (error) {
				console.error("Error fetching session:", error);
				alert(
					"An error occurred while fetching session. Please try again later.",
				);
				return redirect("/sign-in");
			}

			if (!session) {
				console.warn("No session found, redirecting to sign-in page.");
				return redirect("/sign-in");
			}

			if (session && !userContext.user && session.user) {
				// Note: Role.Rejected is not available in current Role enum
				// This check can be removed or updated based on actual role validation needs
				
				userContext.setUser(session.user);
			}
		}
	}, [session, error, isPending, userContext]);

	return (
		<FullScreenLoading isLoading={isPending}>{children}</FullScreenLoading>
	);
};

export default UserWrapper;
