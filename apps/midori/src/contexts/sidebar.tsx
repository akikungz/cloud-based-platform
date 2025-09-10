"use client";
import { createContext, useEffect, useState } from "react";

export interface ISidebarContext {
	isOpen: boolean;
	toggleSidebar: () => void;
	isCollapsed: boolean;
	toggleCollapse: () => void;
}

export const SidebarContext = createContext<ISidebarContext>({
	isOpen: false,
	toggleSidebar: () => {},
	isCollapsed: false,
	toggleCollapse: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isOpen, setIsOpen] = useState(true);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleSidebar = () => {
		setIsOpen((prev) => !prev);
	};

	const toggleCollapse = () => {
		setIsCollapsed((prev) => !prev);
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setIsCollapsed(false);
				setIsOpen(false);
			}

			if (window.innerWidth >= 768) {
				setIsOpen(true);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
		const windowWidth = window.innerWidth;
		if (windowWidth < 768) {
			setIsCollapsed(false);
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
	}, []);

	return (
		<SidebarContext.Provider
			value={{ isOpen, toggleSidebar, isCollapsed, toggleCollapse }}
		>
			{children}
		</SidebarContext.Provider>
	);
};

export default SidebarProvider;
