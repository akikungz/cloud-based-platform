"use client";
import { SidebarContext } from "@midori/contexts/sidebar";
import { UserContext } from "@midori/contexts/user";
import { auth } from "@midori/libs/auth";
import { cn } from "@midori/utils/format";
import { Tooltip } from "@mui/material";
import { Book, ClipboardList, Database, Folder, GraduationCap, LayoutDashboard, LogOut, Server, Settings, User } from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useContext } from "react";
import { Role } from "auth/utils/role";

interface ClientMenuItem {
	href: string;
	label: string;
	icon: React.ReactNode;
	disabled?: boolean;
}

const ClientMenu: Record<Role, ClientMenuItem[]> = {
	[Role.Staff]: [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <LayoutDashboard />,
		},
		{
			href: "/approvals",
			label: "Pending Approvals",
			icon: <ClipboardList />,
		},
		{
			href: "/instances",
			label: "Manage Instances",
			icon: <Database />,
		},
		{
			href: "/storage",
			label: "Storage",
			icon: <Folder />,
			disabled: true, // Placeholder for future feature
		},
		{
			href: "/samesters",
			label: "Samesters",
			icon: <GraduationCap />,
		},
		{
			href: "/courses",
			label: "Courses",
			icon: <Book />,
		},
		{
			href: "/staff",
			label: "Staff",
			icon: <User />,
		},
		{
			href: "/settings",
			label: "Settings",
			icon: <Settings />,
		},
	],
	[Role.Student]: [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <LayoutDashboard />,
		},
		{
			href: "/instance",
			label: "Manage Instances",
			icon: <Database />,
		},
		{
			href: "/settings",
			label: "Settings",
			icon: <Settings />,
		},
	],
	[Role.Rejected]: [],
};

export const Sidebar: React.FC = () => {
	const { isOpen, isCollapsed } = useContext(SidebarContext);
	const { user, isPending } = useContext(UserContext);
	const pathname = usePathname();

	if (isPending) return null;
	if (!user) return redirect("/sign-in");

	return (
		<aside
			className={cn(
				"fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 z-20",
				isOpen ? "translate-x-0" : "-translate-x-full",
				isCollapsed ? "w-16" : "w-64",
				"pt-16 md:pt-0 flex flex-col",
			)}
		>
			<div className="hidden md:flex items-center justify-between px-4 border-b border-vm-blue-200 h-16">
				<Link href="/dashboard" className="flex items-center space-x-3">
					<div
						className={cn(
							"w-8 h-8 rounded-lg flex items-center justify-center",
							[Role.Staff].includes(user.role)
								? "bg-gradient-secondary"
								: "bg-gradient-primary",
						)}
					>
						<Server className="w-5 h-5 text-white" />
					</div>
					<div className={cn(isCollapsed ? "hidden" : "block")}>
						<h2 className="text-lg font-semibold text-vm-blue-900">
							VM Platform
						</h2>
						<p className="text-xs text-vm-blue-600 capitalize">{user.role}</p>
					</div>
				</Link>
			</div>

			<div className="flex flex-col flex-1 items-center gap-1 p-2">
				{ClientMenu[user.role].map((item) => {
					const isActive = pathname === item.href;

					return (
						<Tooltip
							key={item.label}
							title={item.label}
							placement="right"
							arrow
						>
							<Link
								href={!item.disabled ? item.href : "#"}
								className={cn(
									"w-full flex items-center gap-4 py-2.5 text-left transition-colors duration-200 cursor-pointer",
									"hover:bg-vm-blue-100 hover:text-vm-blue-900",
									"text-vm-blue-700 rounded-lg",
									item.disabled ? "cursor-not-allowed opacity-50" : "",
									isCollapsed ? "px-3" : "px-4",
									isActive
										? "bg-vm-blue-100 text-vm-blue-900"
										: "text-vm-blue-700",
								)}
							>
								{item.icon}
								<span
									className={cn(
										"text-sm font-medium",
										isCollapsed ? "hidden" : "block",
									)}
								>
									{item.label}
								</span>
							</Link>
						</Tooltip>
					);
				})}
			</div>

			<div
				className={cn(
					"p-2 border-t border-vm-blue-200 flex-col gap-1",
					isCollapsed ? "hidden" : "flex",
				)}
			>
				<button
					type="button"
					className={cn(
						"w-full flex items-center gap-4 px-4 py-2.5",
						"text-left transition-colors duration-200 cursor-pointer",
						"hover:bg-vm-orange-100 hover:text-vm-orange-900",
						"text-vm-blue-700 rounded-lg",
					)}
					onClick={() => {
						auth.signOut();
						redirect("/");
					}}
				>
					<LogOut className="w-5 h-5" />
					<span className="text-sm font-medium">Sign Out</span>
				</button>
				<p className="text-xs text-vm-blue-600 px-2 py-1">
					This platform is for educational purposes only. Unauthorized use is
					prohibited.
				</p>
			</div>
		</aside>
	);
};
