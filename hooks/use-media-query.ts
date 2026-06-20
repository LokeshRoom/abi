"use client";

import { useState, useEffect } from "react";

const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook that returns true if the current viewport matches the given breakpoint.
 */
export function useMediaQuery(query: Breakpoint | string): boolean {
  const mediaQuery = query in breakpoints
    ? breakpoints[query as Breakpoint]
    : query;

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(mediaQuery);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mediaQuery]);

  return matches;
}
