"use client";
import { Header } from "@midori/components/layouts/Header";
import { Sidebar } from "@midori/components/layouts/Sidebar";
import { SidebarProvider } from "@midori/contexts/sidebar";
import { UserWrapper } from "@midori/components/wrapper/UserWrapper";
import { RouteProtection } from "@midori/components/auth/RouteProtection";
import { cn } from "@midori/utils/format";
import { useContext, useEffect, useRef } from "react";
import { SidebarContext } from "@midori/contexts/sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<UserWrapper>
			<RouteProtection>
				<SidebarProvider>
					<DashboardLayoutContent>{children}</DashboardLayoutContent>
				</SidebarProvider>
			</RouteProtection>
		</UserWrapper>
	);
}

function DashboardLayoutContent({
	children,
}: {
	children: React.ReactNode;
}) {
	const sidebarContext = useContext(SidebarContext);
	const sidebarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Close sidebar on Escape key
			if (event.key === "Escape" && sidebarContext.isOpen) {
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
						if (e.key === "Escape") {
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
					"transition-all duration-300 flex flex-col h-screen",
					sidebarContext.isCollapsed ? "md:ml-16" : "md:ml-64",
				)}
			>
				<Header />
				<main className="p-4 flex-1 max-h-[calc(100vh-64px)] overflow-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
