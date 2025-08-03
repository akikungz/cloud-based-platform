"use client";
import { SidebarProvider } from "@midori/contexts/sidebar";
import { UserContext, UserProvider } from "@midori/contexts/user";
import { authClient, useSession } from "@midori/libs/auth";
import type { PropsWithChildren } from "@midori/types/props";
import { redirect } from "next/navigation";
import { useContext, useEffect } from "react";
import { Role } from "utils";

import { FullScreenLoading } from "./Loading";

export const UserWarper: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<UserProvider>
			<SidebarProvider>
				<UserQuery>{children}</UserQuery>
			</SidebarProvider>
		</UserProvider>
	);
};

const UserQuery: React.FC<PropsWithChildren> = ({ children }) => {
	const userContext = useContext(UserContext);
	const { data: session, isPending, error } = useSession();

	useEffect(() => {
		const _handleSignIn = () => {
			authClient.signIn.social({
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

			if (session && !userContext.user) {
				if (session.user.role === Role.External) {
					alert(
						"You are not authorized to access this platform. Please contact support.",
					);
					authClient.signOut();
					return redirect("/sign-in");
				}

				userContext.setUser(session.user);
			}
		}
	}, [session, error, isPending, userContext]);

	return (
		<FullScreenLoading isLoading={isPending}>{children}</FullScreenLoading>
	);
};

export default UserWarper;
