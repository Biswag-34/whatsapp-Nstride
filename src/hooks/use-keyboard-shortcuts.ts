import { useEffect } from "react";

import { useThemeStore } from "@/stores/use-theme-store";

export function useKeyboardShortcuts() {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (isTyping) {
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-global-search]")?.focus();
      }

      if (event.key.toLowerCase() === "t") {
        toggleTheme();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleTheme]);
}
