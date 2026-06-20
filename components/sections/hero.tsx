"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const taglineVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.5 },
  },
};

export function Hero() {
  return (
    <section className="film-grain relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ═══ Background gradient ═══ */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--overlay-gradient)" }}
      />

      {/* ═══ Subtle radial glow ═══ */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,99,43,0.06)_0%,transparent_70%)]" />

      {/* ═══ Center content ═══ */}
      <motion.div
        className="container-abi relative z-10 flex flex-col items-center gap-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ═══ Wordmark ═══ */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
          <h1
            className={cn(
              "text-glow-orange neon-flicker",
              "font-extrabold leading-[0.85] tracking-tighter"
            )}
            style={{
              fontSize: "var(--text-hero)",
              color: "var(--accent)",
            }}
          >
            Abi
          </h1>
          <span
            className="font-technical tracking-[0.3em] md:tracking-[0.5em]"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
          >
            PHOTO STUDIO
          </span>
        </motion.div>

        {/* ═══ Tagline ═══ */}
        <motion.p
          variants={taglineVariants}
          className="max-w-md text-lg italic md:max-w-lg"
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
          }}
        >
          &ldquo;{SITE.tagline}&rdquo;
        </motion.p>

        {/* ═══ CTA buttons ═══ */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/portfolio"
            className={cn(
              "group relative inline-flex items-center gap-2 rounded-lg px-8 py-3",
              "text-sm font-semibold tracking-wide",
              "transition-all duration-[var(--transition-base)]",
              "hover:shadow-[0_0_30px_rgba(232,99,43,0.3)]"
            )}
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg-primary)",
            }}
          >
            View Portfolio
            <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/booking"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-8 py-3",
              "text-sm font-semibold tracking-wide",
              "transition-all duration-[var(--transition-base)]",
              "hover:border-[var(--border-hover)] hover:bg-[var(--bg-card)]"
            )}
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            Book a Session
          </Link>
        </motion.div>
      </motion.div>

      {/* ═══ Scroll indicator ═══ */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown
          className="h-6 w-6"
          style={{ color: "var(--text-muted)" }}
        />
      </motion.div>
    </section>
  );
}
