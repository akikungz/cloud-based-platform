"use client";
import { darkTheme, theme } from "@midori/styles/mui/theme";
import type { PropsWithChildren } from "@midori/types/props";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { createContext, useState } from "react";

export interface IThemeContext {
	isDarkMode: boolean;
	toggleDarkMode: () => void;
}

export const ThemeContext = createContext<IThemeContext>({
	isDarkMode: false,
	toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const toggleDarkMode = () => {
		setIsDarkMode((prev) => !prev);
	};

	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
			<MuiThemeProvider theme={isDarkMode ? darkTheme : theme}>
				{children}
			</MuiThemeProvider>
		</ThemeContext.Provider>
	);
};
