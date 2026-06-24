"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Magnetic button effect
  const handleBtnMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      setBtnOffset({ x: distX * 0.3, y: distY * 0.3 });
    },
    []
  );

  const handleBtnMouseLeave = useCallback(() => {
    setBtnOffset({ x: 0, y: 0 });
  }, []);

  // Generate particles
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${5 + Math.random() * 8}s`,
        delay: `${Math.random() * 5}s`,
        color:
          i % 3 === 0
            ? "rgba(232, 99, 43, 0.35)"
            : i % 3 === 1
            ? "rgba(168, 216, 65, 0.25)"
            : "rgba(59, 93, 170, 0.25)",
        size: `${2 + Math.random() * 4}px`,
      })),
    []
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ padding: "var(--section-padding) 0" }}
    >
      {/* ═══ Background effects ═══ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(232,99,43,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,93,170,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,216,65,0.04)_0%,transparent_50%)]" />
      </div>

      {/* ═══ Floating particles ═══ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={
              {
                left: p.left,
                top: p.top,
                "--duration": p.duration,
                "--delay": p.delay,
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="container-abi relative z-10 flex flex-col items-center gap-10 text-center">
        {/* ═══ Heading with scroll reveal ═══ */}
        <motion.div style={{ y: headingY, opacity: headingOpacity }}>
          <h2
            className="text-glow-orange text-3xl font-bold tracking-tight md:text-4xl"
            style={{
              fontSize: "var(--text-2xl)",
              color: "var(--text-primary)",
            }}
          >
            Ready to Create Something{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #E8632B, #A8D841)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Extraordinary
            </span>
            ?
          </h2>
        </motion.div>

        <motion.p
          className="max-w-lg text-base leading-relaxed"
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Let&apos;s capture moments that last a lifetime with precision,
          passion, and a cinematic eye.
        </motion.p>

        {/* ═══ Magnetic CTA button ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            ref={btnRef}
            href="/booking"
            onMouseMove={handleBtnMouseMove}
            onMouseLeave={handleBtnMouseLeave}
            className={cn(
              "group relative inline-flex items-center gap-3 rounded-full px-6 py-4 sm:px-12 sm:py-5",
              "text-sm font-semibold tracking-wide",
              "transition-shadow duration-500",
              "hover:shadow-[0_0_60px_rgba(232,99,43,0.3),0_0_120px_rgba(232,99,43,0.1)]"
            )}
            style={{
              background: "linear-gradient(135deg, #E8632B, #D4551F)",
              color: "var(--bg-primary)",
              transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
              transition:
                "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
            }}
          >
            {/* Animated border ring */}
            <span
              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                border: "2px solid rgba(232, 99, 43, 0.5)",
                transform: "scale(1.1)",
              }}
            />
            Let&apos;s Create Together
            <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
