"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  [key: string]: any;
}) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hcm_theme") as Theme | null;
      if (stored === "dark") {
        // Automatically default to the requested clean white theme
        setThemeState("light");
        localStorage.setItem("hcm_theme", "light");
      } else if (stored) {
        setThemeState(stored);
      } else {
        setThemeState("light");
        localStorage.setItem("hcm_theme", "light");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system" || theme === "light") {
      root.classList.add("light");
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem("hcm_theme", newTheme);
    } catch (e) {
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
