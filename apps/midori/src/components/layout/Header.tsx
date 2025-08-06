"use client";
import { SidebarContext } from "@midori/contexts/sidebar";
import { UserContext } from "@midori/contexts/user";
import { authClient } from "@midori/libs/auth";
import { cn, format_name } from "@midori/utils/format";
import { Avatar, Tooltip } from "@mui/material";
import {
	BellIcon,
	ChevronLeft,
	ChevronRight,
	LogOut,
	Menu,
	Server,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { Role } from "utils";

export const Header: React.FC = () => {
	const { user, isPending } = useContext(UserContext);
	const { isOpen, toggleSidebar, isCollapsed, toggleCollapse } =
		useContext(SidebarContext);

	const handleSignOut = async () => {
		await authClient.signOut();
		redirect("/");
	};

	if (isPending) return null;
	if (!user) return redirect("/sign-in");

	return (
		<header className="h-16 bg-white border-b border-vm-blue-200 flex items-center justify-between px-4 shadow-soft sticky top-0 z-30">
			<div className="flex items-center gap-2">
				{/* Toggle sidebar button */}
				<button
					type="button"
					className="p-2 rounded hover:bg-vm-blue-100 transition-colors md:hidden"
					aria-label="Toggle sidebar"
					onClick={toggleSidebar}
				>
					{isOpen ? <ChevronLeft /> : <Menu />}
				</button>
				<Link
					href="/dashboard"
					className={cn(
						"w-8 h-8 rounded-lg md:hidden flex items-center justify-center bg-gradient-primary",
						user.role === Role.Staff
							? "bg-gradient-secondary"
							: "bg-gradient-primary",
					)}
				>
					<Server className="w-5 h-5 text-white" />
				</Link>

				{/* Collapse button */}
				<button
					type="button"
					className={cn(
						"py-2 rounded hover:bg-vm-blue-100 transition-colors hidden md:block absolute z-30",
						isCollapsed ? "-left-3 px-1" : "-left-12 px-2",
					)}
					aria-label="Collapse sidebar"
					onClick={toggleCollapse}
				>
					{isCollapsed ? <ChevronRight /> : <ChevronLeft />}
				</button>
			</div>

			<div className="flex items-center space-x-2">
				<button
					type="button"
					className="p-2 rounded hover:bg-vm-blue-100 transition-colors"
				>
					<BellIcon className="w-5 h-5 text-vm-blue-600" />
				</button>

				<div className="flex items-center space-x-2 pl-3 border-l border-vm-blue-200">
					<div className="flex items-center space-x-2">
						<Tooltip title={user.name} placement="bottom">
							<Avatar
								alt={user.name}
								src={user.image ? user.image : undefined}
								variant="rounded"
							/>
						</Tooltip>
						<div className="hidden md:flex flex-col gap-0.5">
							<span className="text-sm font-semibold">
								{format_name(user.name)}
							</span>
							<span className="text-xs text-vm-blue-500">{user.email}</span>
						</div>
					</div>
					<button
						type="button"
						onClick={handleSignOut}
						className="p-2 rounded hover:bg-vm-orange-100 hover:cursor-pointer transition-colors"
						aria-label="Sign out"
					>
						<LogOut />
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
