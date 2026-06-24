"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, SunMoon } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/layout/theme-provider";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const navItemVariants: Variants = {
  closed: { opacity: 0, y: 30 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.1 + i * 0.08,
    },
  }),
};

const brandVariants: Variants = {
  closed: { opacity: 0, y: 20 },
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.5 },
  },
};

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { toggleLight } = useTheme();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "var(--bg-primary)" }}
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ═══ Scanline overlay ═══ */}
          <div className="scanline-effect pointer-events-none absolute inset-0" />

          {/* ═══ Close button ═══ */}
          <div className="flex justify-end p-6">
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className={cn(
                "relative z-10 rounded-full p-2",
                "transition-colors duration-[var(--transition-fast)]",
                "hover:bg-[var(--bg-card)]"
              )}
            >
              <X
                className="h-7 w-7"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
          </div>

          {/* ═══ Navigation links ═══ */}
          <nav className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
            {NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative block text-3xl font-semibold tracking-wide",
                    "transition-colors duration-[var(--transition-base)]",
                    "hover:text-[var(--accent)]"
                  )}
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.label}
                  {/* Underline on hover */}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-[2px] w-0",
                      "bg-[var(--accent)] transition-all duration-[var(--transition-base)]",
                      "group-hover:w-full"
                    )}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* ═══ Brand footer ═══ */}
          <motion.div
            className="relative z-10 pb-12 text-center flex flex-col items-center gap-4"
            variants={brandVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--accent)" }}
              >
                Abi
              </p>
              <p
                className="font-technical mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {SITE.tagline}
              </p>
            </div>

            <motion.button
              onClick={toggleLight}
              className={cn(
                "p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-center",
                "hover:shadow-[0_0_15px_var(--accent-glow)] hover:bg-[var(--bg-card)]"
              )}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              <SunMoon size={18} className="mr-2" />
              <span className="font-technical text-xs tracking-wider">Toggle Theme</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
