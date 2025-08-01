import "@midori/styles/globals.css";
import { ThemeProvider } from "@midori/contexts/theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "FITM Cloud",
	description:
		"A platform for managing virtual machines in the Department of Information Technology, Faculty of Industrial Technology and Management, King Mongkut's University of Technology North Bangkok.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body suppressHydrationWarning>
				<div id="root">
					<ThemeProvider>{children}</ThemeProvider>
				</div>
			</body>
		</html>
	);
}
