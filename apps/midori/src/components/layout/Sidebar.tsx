"use client";
import { SidebarContext } from "@midori/contexts/sidebar";
import { UserContext } from "@midori/contexts/user";
import { cn } from "@midori/utils/format";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BookIcon from "@mui/icons-material/Book";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import { Server } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useContext } from "react";
import { Role } from "utils";

const ClientMenu: Record<
	keyof typeof Role,
	Omit<MenuItemProps, "handleClick">[]
> = {
	[Role.Staff]: [
		{
			href: "/dashboard",
			label: "Dashboard",
			icon: <DashboardIcon />,
		},
		{
			href: "/approval",
			label: "Approval Queue",
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
	const { isOpen } = useContext(SidebarContext);
	const { user, isPending } = useContext(UserContext);
	const router = useRouter();

	const handleNavigation = (path: string) => {
		router.push(path);
	};

	if (isPending) return null;
	if (!user) {
		redirect("/sign-in");
	}

	return (
		<aside
			className={cn(
				"fixed top-0 left-0 h-full w-64 bg-white border-r border-vm-blue-200 md:border-none shadow-soft transition-transform",
				isOpen ? "translate-x-0" : "-translate-x-full",
				"md:translate-x-0 z-20",
				"pt-16 md:pt-0 flex flex-col",
			)}
		>
			{/* Heading */}
			<div className="flex items-center justify-between px-4 border-b border-vm-blue-200 h-16">
				<div className="flex items-center space-x-3">
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
					<div>
						<h2 className="text-lg font-semibold text-vm-blue-900">
							VM Platform
						</h2>
						<p className="text-xs text-vm-blue-600 capitalize">{user.role}</p>
					</div>
				</div>
			</div>

			{/* Menu Items */}
			<nav className="my-4 flex-1 px-2 space-y-2 overflow-y-auto">
				{Object.entries(ClientMenu)
					.filter(([role]) => user.role === role)
					.flatMap(([, items]) => items)
					.map((item) => (
						<MenuItem
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							handleClick={handleNavigation}
						/>
					))}
			</nav>

			{/* Footer */}
			<div className="p-4 border-t border-vm-blue-200">
				<p className="text-xs text-vm-blue-600">
					This platform is for educational purposes only. Unauthorized use is
					prohibited.
				</p>
			</div>
		</aside>
	);
};

interface MenuItemProps {
	href: string;
	label: string;
	icon?: React.ReactNode;
	disabled?: boolean;
	handleClick?: (path: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
	href,
	label,
	icon,
	handleClick,
	disabled,
}) => {
	const active = href === window.location.pathname;

	return (
		<button
			type="button"
			className={cn(
				"w-full flex items-center space-x-4 px-4 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer",
				active
					? "bg-gradient-primary text-white shadow-medium"
					: "text-vm-blue-700 hover:bg-vm-blue-100 hover:text-vm-blue-900",
			)}
			onClick={() => {
				if (handleClick) {
					handleClick(href);
				}
			}}
			disabled={disabled}
		>
			{icon && <>{icon}</>}
			<span className="text-sm font-medium">{label}</span>
		</button>
	);
};

export default Sidebar;
