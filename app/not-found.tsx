"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="scanline-effect relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ═══ Rule-of-thirds grid lines ═══ */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 bottom-0 left-1/3 w-px opacity-30"
          style={{ backgroundColor: "var(--border)" }}
        />
        <div
          className="absolute top-0 bottom-0 left-2/3 w-px opacity-30"
          style={{ backgroundColor: "var(--border)" }}
        />
        <div
          className="absolute right-0 left-0 top-1/3 h-px opacity-30"
          style={{ backgroundColor: "var(--border)" }}
        />
        <div
          className="absolute right-0 left-0 top-2/3 h-px opacity-30"
          style={{ backgroundColor: "var(--border)" }}
        />
      </div>

      <div className="container-abi relative z-10 flex flex-col items-center gap-6 text-center">
        {/* ═══ 404 with glitch effect ═══ */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={cn(
            "glitch-text text-glow-orange",
            "font-technical text-8xl font-bold tracking-wider md:text-9xl"
          )}
          data-text="404"
          style={{ color: "var(--accent)" }}
        >
          404
        </motion.h1>

        {/* ═══ Message ═══ */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-technical text-sm tracking-[0.2em]"
          style={{ color: "var(--text-secondary)" }}
        >
          FRAME NOT FOUND
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-sm text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          The frame you&apos;re looking for doesn&apos;t exist in this roll.
          It may have been moved or never developed.
        </motion.p>

        {/* ═══ Return link ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/"
            className={cn(
              "group mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3",
              "font-technical text-xs tracking-[0.15em]",
              "glass-card",
              "transition-all duration-300",
              "hover:scale-105 active:scale-95"
            )}
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:-translate-x-1">
              ←
            </span>
            RETURN TO VIEWFINDER
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
