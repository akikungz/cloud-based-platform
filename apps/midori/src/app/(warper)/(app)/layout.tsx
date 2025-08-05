"use client";
import { Header } from "@midori/components/layout/Header";
import { Sidebar } from "@midori/components/layout/Sidebar";
import { SidebarContext } from "@midori/contexts/sidebar";
import type { PropsWithChildren } from "@midori/types/props";
import { cn } from "@midori/utils/format";
import { useContext, useEffect, useRef } from "react";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
	const sidebarContext = useContext(SidebarContext);
	const sidebarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Close sidebar on Escape key
			if (event.key === 'Escape' && sidebarContext.isOpen) {
				sidebarContext.toggleSidebar();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [sidebarContext]);

	return (
		<div className="min-h-dvh bg-gradient-accent dark:bg-gradient-accent-dark transition-all duration-300">
			{/* Mobile Overlay */}
			{sidebarContext.isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/0 z-10 md:hidden cursor-default"
					onClick={sidebarContext.toggleSidebar}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							sidebarContext.toggleSidebar();
						}
					}}
					aria-label="Close sidebar"
				/>
			)}

			{/* Sidebar */}
			<div ref={sidebarRef}>
				<Sidebar />
			</div>

			{/* Main Content */}
			<div
				className={cn(
					"transition-all duration-300",
					sidebarContext.isCollapsed ? "md:ml-16" : "md:ml-64",
				)}
			>
				<Header />
				<main className="p-6 pt-6">{children}</main>
			</div>
		</div>
	);
};

export default Layout;
