"use client";
import { createContext, useState } from "react";
import type { Role } from "utils";

export type User = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role: Role;
};

export type IUserContext = {
	user: User | null;
	setUser: (user: IUserContext["user"]) => void;
	isPending: boolean;
	setIsPending: (isPending: boolean) => void;
};

export const UserContext = createContext<IUserContext>({
	user: null,
	setUser: () => void 0,
	isPending: false,
	setIsPending: () => void 0,
});

export const UserProvider = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const [user, setUser] = useState<IUserContext["user"]>(null);
	const [isPending, setIsPending] = useState<IUserContext["isPending"]>(false);

	return (
		<UserContext.Provider value={{ user, setUser, isPending, setIsPending }}>
			{children}
		</UserContext.Provider>
	);
};
