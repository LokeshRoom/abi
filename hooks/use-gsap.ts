"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

/**
 * Hook that registers GSAP plugins and provides a scoped context
 * for automatic cleanup on unmount.
 */
export function useGSAP(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins?: any[]
) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (plugins && plugins.length > 0) {
      gsap.registerPlugin(...plugins);
    }
  }, [plugins]);

  useEffect(() => {
    if (scopeRef.current) {
      contextRef.current = gsap.context(() => {}, scopeRef.current);
    }

    return () => {
      contextRef.current?.revert();
    };
  }, []);

  const addAnimation = useCallback(
    (fn: () => gsap.core.Timeline | gsap.core.Tween | void) => {
      if (contextRef.current) {
        contextRef.current.add(fn);
      }
    },
    []
  );

  return { scopeRef, contextRef, addAnimation };
}

/**
 * Hook that checks for prefers-reduced-motion.
 */
export function usePrefersReducedMotion(): boolean {
  const ref = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    ref.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return ref.current;
}
