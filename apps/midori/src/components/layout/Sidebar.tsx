"use client";
import { SidebarContext } from "@midori/contexts/sidebar";
import { UserContext } from "@midori/contexts/user";
import { authClient } from "@midori/libs/auth";
import { cn } from "@midori/utils/format";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BookIcon from "@mui/icons-material/Book";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import { Tooltip } from "@mui/material";
import { LogOut, Server } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { Role } from "utils";

interface ClientMenuItem {
	href: string;
	label: string;
	icon: React.ReactNode;
	disabled?: boolean;
}

const ClientMenu: Record<keyof typeof Role, ClientMenuItem[]> = {
	[Role.Staff]: [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <DashboardIcon />,
		},
		{
			href: "/approval",
			label: "Pending Approvals",
			icon: <AssignmentIcon />,
		},
		{
			href: "/instance",
			label: "Manage Instances",
			icon: <StorageIcon />,
		},
		{
			href: "/storage",
			label: "Storage",
			icon: <FolderIcon />,
			disabled: true, // Placeholder for future feature
		},
		{
			href: "/samester",
			label: "Samesters",
			icon: <SchoolIcon />,
		},
		{
			href: "/course",
			label: "Courses",
			icon: <BookIcon />,
		},
		{
			href: "/staff",
			label: "Staff",
			icon: <PersonIcon />,
		},
		{
			href: "/settings",
			label: "Settings",
			icon: <SettingsIcon />,
		},
	],
	[Role.Student]: [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <DashboardIcon />,
		},
		{
			href: "/instance",
			label: "Manage Instances",
			icon: <StorageIcon />,
		},
		{
			href: "/settings",
			label: "Settings",
			icon: <SettingsIcon />,
		},
	],
	[Role.External]: [],
};

export const Sidebar: React.FC = () => {
	const { isOpen, isCollapsed } = useContext(SidebarContext);
	const { user, isPending } = useContext(UserContext);

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
							user.role === Role.Staff
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
						authClient.signOut();
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
