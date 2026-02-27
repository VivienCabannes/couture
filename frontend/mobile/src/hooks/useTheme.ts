import { createContext, useContext } from "react";
import type { ColorPalette } from "../theme/colors";
import { lightColors } from "../theme/colors";

export interface ThemeContextValue {
  isDark: boolean;
  colors: ColorPalette;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

/** Returns the current theme context (isDark, colors, toggleTheme). */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
