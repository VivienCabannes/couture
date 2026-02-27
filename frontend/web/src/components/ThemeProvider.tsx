import { useState, useCallback, type ReactNode } from "react";
import { ThemeContext } from "../hooks/useTheme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
