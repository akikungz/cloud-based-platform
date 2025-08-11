"use client";
import { UserWarper } from "@midori/components/warper/User";
import { SidebarProvider } from "@midori/contexts/sidebar";
import type { PropsWithChildren } from "@midori/types/props";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
	return (
		<UserWarper>
			<SidebarProvider>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					{children}
				</LocalizationProvider>
			</SidebarProvider>
		</UserWarper>
	);
};

export default Layout;
