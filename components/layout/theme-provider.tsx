"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ROUTE_THEME_MAP, type ThemeMode } from "@/lib/constants";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "brand",
  setMode: () => {},
  isTransitioning: false,
  setIsTransitioning: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getThemeForPath(pathname: string): ThemeMode {
  // Exact match first
  if (ROUTE_THEME_MAP[pathname]) {
    return ROUTE_THEME_MAP[pathname];
  }
  // Prefix match
  for (const [route, theme] of Object.entries(ROUTE_THEME_MAP)) {
    if (pathname.startsWith(route) && route !== "/") {
      return theme;
    }
  }
  return "gallery";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<ThemeMode>(() => getThemeForPath(pathname));
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newMode = getThemeForPath(pathname);
    if (newMode !== mode) {
      setMode(newMode);
    }
  }, [pathname, mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
