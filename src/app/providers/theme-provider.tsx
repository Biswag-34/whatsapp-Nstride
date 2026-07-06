import { useEffect, type PropsWithChildren } from "react";

import { useThemeStore } from "@/stores/use-theme-store";

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return children;
}
