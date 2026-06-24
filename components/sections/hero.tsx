"use client";

import { Suspense, lazy, useRef, useMemo } from "react";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Canvas } from "@react-three/fiber";

const FloatingPhotosScene = lazy(() =>
  import("@/components/three/floating-photos-scene").then((m) => ({
    default: m.FloatingPhotosScene,
  }))
);

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -80 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
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
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.2 },
  },
};

// Floating particles for depth
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${4 + Math.random() * 6}s`,
        delay: `${Math.random() * 4}s`,
        color:
          i % 3 === 0
            ? "rgba(232, 99, 43, 0.4)"
            : i % 3 === 1
            ? "rgba(168, 216, 65, 0.3)"
            : "rgba(59, 93, 170, 0.3)",
        size: `${2 + Math.random() * 3}px`,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            "--duration": p.duration,
            "--delay": p.delay,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  // Split "Abi" into characters for stagger
  const brandName = "Abi";
  const chars = brandName.split("");

  return (
    <section
      ref={sectionRef}
      className="film-grain relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* ═══ Background gradient ═══ */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--overlay-gradient)" }}
      />

      {/* ═══ Radial glow ═══ */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,99,43,0.06)_0%,transparent_70%)]" />

      {/* ═══ Floating particles ═══ */}
      <Particles />

      {/* ═══ 3D Photo Canvas (right/background) — Hidden on mobile for performance & touch scrolling ═══ */}
      <motion.div
        className="absolute inset-0 z-0 hidden md:block"
        style={{ y: canvasY, opacity }}
      >
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
          >
            <FloatingPhotosScene />
          </Canvas>
        </Suspense>
      </motion.div>

      {/* ═══ Dark vignette over canvas ═══ */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(10,10,10,0.7)_100%)]" />

      {/* ═══ Center content ═══ */}
      <motion.div
        className="container-abi relative z-10 flex flex-col items-center gap-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: textY, scale }}
      >
        {/* ═══ Wordmark with character stagger ═══ */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
          <h1
            className="text-glow-orange flex overflow-hidden perspective-container"
            style={{ fontSize: "var(--text-hero)" }}
          >
            {chars.map((char, i) => (
              <motion.span
                key={i}
                variants={charVariants}
                className="neon-flicker inline-block font-extrabold leading-[0.85] tracking-tighter"
                style={{
                  color: "var(--accent)",
                  transformStyle: "preserve-3d",
                }}
              >
                {char}
              </motion.span>
            ))}
          </h1>
          <motion.span
            className="font-technical tracking-[0.3em] md:tracking-[0.5em]"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
            variants={itemVariants}
          >
            PHOTO STUDIO
          </motion.span>
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
              "hover:shadow-[0_0_40px_rgba(232,99,43,0.4)] hover:scale-105",
              "active:scale-95"
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
              "glass-card inline-flex items-center gap-2 rounded-lg px-8 py-3",
              "text-sm font-semibold tracking-wide",
              "hover:scale-105 active:scale-95",
              "transition-transform duration-[var(--transition-base)]"
            )}
            style={{
              color: "var(--text-primary)",
            }}
          >
            Book a Session
          </Link>
        </motion.div>
      </motion.div>

      {/* ═══ Scroll indicator ═══ */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span
            className="font-technical text-[9px] tracking-[0.3em]"
            style={{ color: "var(--text-muted)" }}
          >
            SCROLL
          </span>
          <ChevronDown
            className="h-5 w-5"
            style={{ color: "var(--text-muted)" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
