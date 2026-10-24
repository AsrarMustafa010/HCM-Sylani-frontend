"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hcm_theme") as Theme | null;
      if (stored === "dark" || stored === "light" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem("hcm_theme", newTheme);
    } catch {
      // ignore
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
