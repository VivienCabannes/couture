import { useState, useCallback, type ReactNode } from "react";
import { ThemeContext } from "../hooks/useTheme";
import { lightColors, darkColors } from "./colors";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
