"use client";
import { createTheme } from "@mui/material/styles";

// CSS color variables mapping
const cssColors = {
	// Base colors
	background: "#ffffff",
	foreground: "#0c1525",
	primary: "#1374d9",
	primaryForeground: "#ffffff",
	secondary: "#eef3f8",
	secondaryForeground: "#0c1525",
	muted: "#eef3f8",
	mutedForeground: "#5c6b7a",
	accent: "#eef3f8",
	accentForeground: "#0c1525",
	destructive: "#dc3545",
	destructiveForeground: "#ffffff",
	border: "#d9e1e8",
	input: "#d9e1e8",
	ring: "#1374d9",

	// VM Blue palette
	vmBlue: {
		50: "#f0f7ff",
		100: "#c9e2ff",
		200: "#93ccff",
		300: "#5db6ff",
		400: "#2699ff",
		500: "#1374d9",
		600: "#105fb3",
		700: "#0d4a8c",
		800: "#0a3566",
		900: "#07203f",
	},

	// VM Orange palette
	vmOrange: {
		50: "#fef7f0",
		100: "#fde0b8",
		200: "#fbc980",
		300: "#f9b248",
		400: "#f79b10",
		500: "#e87c00",
		600: "#d16800",
		700: "#b95500",
		800: "#a24200",
		900: "#8a2f00",
	},

	// Dark mode colors
	dark: {
		background: "#0a0a0b",
		foreground: "#fafafa",
		primary: "#fafafa",
		primaryForeground: "#18181b",
		secondary: "#27272a",
		secondaryForeground: "#fafafa",
		muted: "#27272a",
		mutedForeground: "#a1a1aa",
		accent: "#27272a",
		accentForeground: "#fafafa",
		destructive: "#7f1d1d",
		destructiveForeground: "#fafafa",
		border: "#27272a",
		input: "#27272a",
		ring: "#d4d4d8",
	},
};

export const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: cssColors.primary,
			light: cssColors.vmBlue[400],
			dark: cssColors.vmBlue[600],
			contrastText: cssColors.primaryForeground,
		},
		secondary: {
			main: cssColors.vmOrange[500],
			light: cssColors.vmOrange[400],
			dark: cssColors.vmOrange[600],
			contrastText: cssColors.primaryForeground,
		},
		error: {
			main: cssColors.destructive,
			light: "#ff5252",
			dark: "#c62828",
			contrastText: cssColors.destructiveForeground,
		},
		warning: {
			main: cssColors.vmOrange[500],
			light: cssColors.vmOrange[300],
			dark: cssColors.vmOrange[700],
			contrastText: cssColors.primaryForeground,
		},
		info: {
			main: cssColors.vmBlue[500],
			light: cssColors.vmBlue[300],
			dark: cssColors.vmBlue[700],
			contrastText: cssColors.primaryForeground,
		},
		success: {
			main: "#4caf50",
			light: "#81c784",
			dark: "#388e3c",
			contrastText: cssColors.primaryForeground,
		},
		grey: {
			50: cssColors.vmBlue[50],
			100: cssColors.secondary,
			200: cssColors.border,
			300: cssColors.mutedForeground,
			400: "#9e9e9e",
			500: "#616161",
			600: "#757575",
			700: cssColors.vmBlue[700],
			800: cssColors.vmBlue[800],
			900: cssColors.foreground,
		},
		background: {
			default: cssColors.background,
			paper: cssColors.background,
		},
		text: {
			primary: cssColors.foreground,
			secondary: cssColors.mutedForeground,
			disabled: cssColors.mutedForeground,
		},
		divider: cssColors.border,
		action: {
			hover: cssColors.accent,
			selected: cssColors.vmBlue[50],
			disabled: cssColors.mutedForeground,
			disabledBackground: cssColors.muted,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem", // matches --radius from CSS
					textTransform: "none",
					fontWeight: 500,
				},
				containedPrimary: {
					background: `linear-gradient(135deg, ${cssColors.vmBlue[500]}, ${cssColors.vmBlue[400]})`,
					"&:hover": {
						background: `linear-gradient(135deg, ${cssColors.vmBlue[600]}, ${cssColors.vmBlue[500]})`,
					},
				},
				containedSecondary: {
					background: `linear-gradient(135deg, ${cssColors.vmOrange[500]}, ${cssColors.vmOrange[400]})`,
					"&:hover": {
						background: `linear-gradient(135deg, ${cssColors.vmOrange[600]}, ${cssColors.vmOrange[500]})`,
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					boxShadow: "0 4px 20px -2px rgba(19, 116, 217, 0.08)",
					"&:hover": {
						boxShadow: "0 8px 30px -4px rgba(19, 116, 217, 0.15)",
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: "0.5rem",
						"& fieldset": {
							borderColor: cssColors.border,
						},
						"&:hover fieldset": {
							borderColor: cssColors.ring,
						},
						"&.Mui-focused fieldset": {
							borderColor: cssColors.ring,
						},
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
				},
			},
		},
	},
	typography: {
		fontFamily: "inherit",
		h1: {
			color: cssColors.foreground,
		},
		h2: {
			color: cssColors.foreground,
		},
		h3: {
			color: cssColors.foreground,
		},
		h4: {
			color: cssColors.foreground,
		},
		h5: {
			color: cssColors.foreground,
		},
		h6: {
			color: cssColors.foreground,
		},
		body1: {
			color: cssColors.foreground,
		},
		body2: {
			color: cssColors.mutedForeground,
		},
	},
	shape: {
		borderRadius: 8, // 0.5rem = 8px
	},
});

// Dark theme variant
export const darkTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: cssColors.dark.primary,
			light: cssColors.vmBlue[300],
			dark: cssColors.vmBlue[700],
			contrastText: cssColors.dark.primaryForeground,
		},
		secondary: {
			main: cssColors.vmOrange[400],
			light: cssColors.vmOrange[300],
			dark: cssColors.vmOrange[600],
			contrastText: cssColors.dark.primaryForeground,
		},
		error: {
			main: cssColors.dark.destructive,
			light: "#ff8a80",
			dark: "#d32f2f",
			contrastText: cssColors.dark.destructiveForeground,
		},
		warning: {
			main: cssColors.vmOrange[400],
			light: cssColors.vmOrange[300],
			dark: cssColors.vmOrange[600],
			contrastText: cssColors.dark.primaryForeground,
		},
		info: {
			main: cssColors.vmBlue[400],
			light: cssColors.vmBlue[300],
			dark: cssColors.vmBlue[600],
			contrastText: cssColors.dark.primaryForeground,
		},
		success: {
			main: "#66bb6a",
			light: "#81c784",
			dark: "#388e3c",
			contrastText: cssColors.dark.primaryForeground,
		},
		grey: {
			50: cssColors.dark.secondary,
			100: cssColors.dark.muted,
			200: cssColors.dark.border,
			300: "#424242",
			400: "#616161",
			500: "#757575",
			600: "#9e9e9e",
			700: "#bdbdbd",
			800: "#e0e0e0",
			900: cssColors.dark.foreground,
		},
		background: {
			default: cssColors.dark.background,
			paper: cssColors.dark.secondary,
		},
		text: {
			primary: cssColors.dark.foreground,
			secondary: cssColors.dark.mutedForeground,
			disabled: cssColors.dark.mutedForeground,
		},
		divider: cssColors.dark.border,
		action: {
			hover: cssColors.dark.accent,
			selected: cssColors.vmBlue[900],
			disabled: cssColors.dark.mutedForeground,
			disabledBackground: cssColors.dark.muted,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					textTransform: "none",
					fontWeight: 500,
				},
				containedPrimary: {
					background: `linear-gradient(135deg, ${cssColors.vmBlue[500]}, ${cssColors.vmBlue[400]})`,
					"&:hover": {
						background: `linear-gradient(135deg, ${cssColors.vmBlue[600]}, ${cssColors.vmBlue[500]})`,
					},
				},
				containedSecondary: {
					background: `linear-gradient(135deg, ${cssColors.vmOrange[500]}, ${cssColors.vmOrange[400]})`,
					"&:hover": {
						background: `linear-gradient(135deg, ${cssColors.vmOrange[600]}, ${cssColors.vmOrange[500]})`,
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
					boxShadow: "0 4px 20px -2px rgba(19, 116, 217, 0.08)",
					"&:hover": {
						boxShadow: "0 8px 30px -4px rgba(19, 116, 217, 0.15)",
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: "0.5rem",
						"& fieldset": {
							borderColor: cssColors.dark.border,
						},
						"&:hover fieldset": {
							borderColor: cssColors.dark.ring,
						},
						"&.Mui-focused fieldset": {
							borderColor: cssColors.dark.ring,
						},
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: "0.5rem",
				},
			},
		},
	},
	typography: {
		fontFamily: "inherit",
		h1: {
			color: cssColors.dark.foreground,
		},
		h2: {
			color: cssColors.dark.foreground,
		},
		h3: {
			color: cssColors.dark.foreground,
		},
		h4: {
			color: cssColors.dark.foreground,
		},
		h5: {
			color: cssColors.dark.foreground,
		},
		h6: {
			color: cssColors.dark.foreground,
		},
		body1: {
			color: cssColors.dark.foreground,
		},
		body2: {
			color: cssColors.dark.mutedForeground,
		},
	},
	shape: {
		borderRadius: 8,
	},
});
