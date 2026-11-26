import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

// In-memory runtime preference (resets cleanly on reload, zero localStorage contamination)
let currentTheme: ThemeMode = "light";
const listeners = new Set<() => void>();

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function setThemeMode(mode: ThemeMode) {
  currentTheme = mode;
  applyThemeToDocument(mode);
  listeners.forEach((fn) => fn());
}

export function toggleThemeMode() {
  setThemeMode(currentTheme === "dark" ? "light" : "dark");
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(currentTheme);

  useEffect(() => {
    applyThemeToDocument(currentTheme);
    const update = () => setMode(currentTheme);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  return {
    theme: mode,
    isDark: mode === "dark",
    toggleTheme: toggleThemeMode,
    setTheme: setThemeMode,
  };
}
