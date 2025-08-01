"use client";
import { SidebarContext } from "@midori/contexts/sidebar";
import { UserContext } from "@midori/contexts/user";
import { authClient } from "@midori/libs/auth";
import { format_name } from "@midori/utils/format";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Tooltip } from "@mui/material";
import { BellIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { Role } from "utils";

export const Header: React.FC = () => {
	const { user, isPending } = useContext(UserContext);
	const { isOpen, toggleSidebar } = useContext(SidebarContext);

	const handleSignOut = async () => {
		await authClient.signOut();
		redirect("/");
	};

	if (isPending) return null;
	if (!user) {
		redirect("/sign-in");
	}

	return (
		<header className="h-16 bg-white border-b border-vm-blue-200 flex items-center justify-between px-4 shadow-soft sticky top-0 z-30">
			<div>
				<button
					type="button"
					className="p-2 rounded hover:bg-vm-blue-100 transition-colors md:hidden"
					aria-label="Toggle sidebar"
					onClick={toggleSidebar}
				>
					{isOpen ? <ArrowBackIosIcon /> : <MenuIcon />}
				</button>
			</div>

			<div className="flex items-center space-x-2">
				{user.role === Role.Staff && (
					<Link href="/vm/create" passHref>
						<button
							type="button"
							className="p-2 bg-gradient-secondary text-white rounded-full shadow-md hover:bg-gradient-secondary-dark transition-colors flex items-center sm:space-x-2 hover:cursor-pointer"
						>
							<AddIcon className="w-5 h-5" />
							<span className="hidden sm:inline mr-1">Create VM</span>
						</button>
					</Link>
				)}

				{user.role === Role.Student && (
					<Link href="/vm/request" passHref>
						<button
							type="button"
							className="p-2 bg-gradient-primary text-white rounded-full shadow-md hover:bg-gradient-primary-dark transition-colors flex items-center sm:space-x-2 hover:cursor-pointer"
						>
							<AddIcon className="w-5 h-5" />
							<span className="hidden sm:inline mr-1">Request VM</span>
						</button>
					</Link>
				)}

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
						className="p-2 rounded hover:bg-vm-blue-100 hover:cursor-pointer transition-colors"
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
