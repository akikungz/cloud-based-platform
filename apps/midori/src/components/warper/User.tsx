"use client";

import { type IUserContext, UserContext } from "@midori/contexts/user";
import { eden } from "@midori/libs/momoi";
import { redirect } from "next/navigation";
import { useContext, useEffect, useState } from "react";

import { FullScreenLoading } from "./Loading";

export const User: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const userContext = useContext(UserContext);

	useEffect(() => {
		eden.api.v1.me
			.get()
			.then((response) => {
				if (response.status === 200) {
					if (response.data) {
						userContext.setUser(
							response.data as unknown as IUserContext["user"],
						);
						setIsLoading(false);
						return response.data;
					}

					return null;
				} else {
					console.error("Failed to fetch user data:", response.data);
					redirect("/sign-in"); // Use Next.js redirect for better handling
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
				redirect("/sign-in"); // Use Next.js redirect for better handling
			});
	}, [userContext.setUser]);

	return (
		<FullScreenLoading isLoading={isLoading}>{children}</FullScreenLoading>
	);
};

export default User;
