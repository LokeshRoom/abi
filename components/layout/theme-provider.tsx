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
  toggleLight: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "brand",
  setMode: () => {},
  isTransitioning: false,
  setIsTransitioning: () => {},
  toggleLight: () => {},
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

const isPublicRoute = (path: string) => {
  return !(
    path.startsWith("/admin") ||
    path.startsWith("/gallery") ||
    path === "/login"
  );
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Initialize mode state.
  const [mode, setMode] = useState<ThemeMode>(() => getThemeForPath(pathname));

  useEffect(() => {
    setMounted(true);
    const baseTheme = getThemeForPath(pathname);
    if (isPublicRoute(pathname)) {
      const savedTheme = localStorage.getItem("theme-preference");
      if (savedTheme === "light") {
        setMode("light");
      } else {
        setMode(baseTheme);
      }
    } else {
      setMode(baseTheme);
    }
  }, [pathname]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", mode);
    }
  }, [mode, mounted]);

  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    if (newMode === "light" || newMode === "brand") {
      localStorage.setItem("theme-preference", newMode);
    }
  }, []);

  const toggleLight = useCallback(() => {
    if (!isPublicRoute(pathname)) return;
    
    const newTheme = mode === "light" ? "brand" : "light";
    setMode(newTheme);
    localStorage.setItem("theme-preference", newTheme);
  }, [mode, pathname]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        isTransitioning,
        setIsTransitioning,
        toggleLight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
