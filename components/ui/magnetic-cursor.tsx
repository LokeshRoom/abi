"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function MagneticCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<"default" | "hover" | "view" | "text">("default");
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const isTouchDevice = useRef(false);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    },
    [cursorX, cursorY, isVisible]
  );

  useEffect(() => {
    // Detect touch device
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) return;

    window.addEventListener("mousemove", handleMouseMove);
    
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Observe interactive elements
    const handleElementHover = () => setCursorVariant("hover");
    const handleElementLeave = () => setCursorVariant("default");
    const handleViewHover = () => setCursorVariant("view");
    const handleTextHover = () => setCursorVariant("text");

    const setupListeners = () => {
      // Buttons, links, interactive elements
      document.querySelectorAll("a, button, [role='button'], input, select, textarea").forEach((el) => {
        el.addEventListener("mouseenter", handleElementHover);
        el.addEventListener("mouseleave", handleElementLeave);
      });

      // Portfolio items / viewable images
      document.querySelectorAll("[data-cursor='view']").forEach((el) => {
        el.addEventListener("mouseenter", handleViewHover);
        el.addEventListener("mouseleave", handleElementLeave);
      });

      // Text elements
      document.querySelectorAll("[data-cursor='text']").forEach((el) => {
        el.addEventListener("mouseenter", handleTextHover);
        el.addEventListener("mouseleave", handleElementLeave);
      });
    };

    setupListeners();

    // Re-setup on DOM changes
    const observer = new MutationObserver(() => {
      setupListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
    };
  }, [handleMouseMove]);

  if (isTouchDevice.current) return null;

  const variants = {
    default: { width: 16, height: 16, backgroundColor: "rgba(232, 99, 43, 0.6)" },
    hover: { width: 48, height: 48, backgroundColor: "rgba(232, 99, 43, 0.15)", border: "2px solid rgba(232, 99, 43, 0.5)" },
    view: { width: 80, height: 80, backgroundColor: "rgba(232, 99, 43, 0.12)", border: "2px solid rgba(232, 99, 43, 0.4)" },
    text: { width: 4, height: 32, backgroundColor: "rgba(232, 99, 43, 0.8)", borderRadius: "2px" },
  };

  const currentVariant = variants[cursorVariant];

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full mix-blend-difference"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: currentVariant.width,
          height: currentVariant.height,
          backgroundColor: currentVariant.backgroundColor,
          border: "border" in currentVariant ? currentVariant.border : "none",
          borderRadius: cursorVariant === "text" ? "2px" : "50%",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* View text inside cursor */}
        {cursorVariant === "view" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-[0.15em] uppercase"
            style={{ color: "#E8632B", fontFamily: "var(--font-mono)" }}
          >
            View
          </motion.span>
        )}
      </motion.div>

      {/* Hide default cursor globally */}
      <style jsx global>{`
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
