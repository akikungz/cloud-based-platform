"use client";
import { createContext, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider as MuiThemeProvider } from "@mui/material";

import { cn } from "@midori/utils/format";
import { darkTheme, theme as lightTheme } from "@midori/styles/mui/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export type Theme = "light" | "dark";

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => { }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased")} cz-shortcut-listen="true">
        <MuiThemeProvider theme={lightTheme}>
          {children}
        </MuiThemeProvider>
      </body>
    </ThemeContext.Provider>
  );
}
