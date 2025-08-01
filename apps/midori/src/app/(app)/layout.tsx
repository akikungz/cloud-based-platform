"use client";
import { Header } from "@midori/components/layout/Header";
import { Sidebar } from "@midori/components/layout/Sidebar";
import { UserWarper } from "@midori/components/warper/User";
import type { PropsWithChildren } from "@midori/types/props";
import { cn } from "@midori/utils/format";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<UserWarper>
			<div className="min-h-dvh bg-gradient-accent">
				{/* Sidebar */}
				<Sidebar />

				{/* Main Content */}
				<div className={cn("transition-all duration-300 md:ml-64")}>
					<Header />
					<main className="p-6 pt-6">{children}</main>
				</div>
			</div>
		</UserWarper>
	);
};

export default Layout;
