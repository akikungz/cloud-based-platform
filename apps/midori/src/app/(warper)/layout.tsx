"use client";
import { UserWarper } from "@midori/components/warper/User";
import { SidebarProvider } from "@midori/contexts/sidebar";
import type { PropsWithChildren } from "@midori/types/props";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<UserWarper>
			<SidebarProvider>{children}</SidebarProvider>
		</UserWarper>
	);
};

export default Layout;
