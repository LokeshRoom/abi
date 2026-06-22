"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { Camera, ImageIcon, Video, Users } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    icon: Camera,
    title: "Portrait Photography",
    description:
      "Intimate, expressive portraits that reveal character and emotion through masterful lighting.",
    color: "#E8632B",
  },
  {
    icon: ImageIcon,
    title: "Event Coverage",
    description:
      "Comprehensive event documentation capturing every pivotal moment with cinematic flair.",
    color: "#A8D841",
  },
  {
    icon: Video,
    title: "Cinematic Sessions",
    description:
      "Film-inspired photo sessions with dramatic lighting, color grading, and narrative composition.",
    color: "#3B5DAA",
  },
  {
    icon: Users,
    title: "Brand & Commercial",
    description:
      "Elevated visual content for brands seeking authentic, story-driven imagery.",
    color: "#E8632B",
  },
];

const STATS = [
  { label: "Photo Sessions", value: 500, suffix: "+" },
  { label: "Years Experience", value: 3, suffix: "+" },
  { label: "Happy Clients", value: 200, suffix: "+" },
  { label: "Awards", value: 5, suffix: "" },
];

// Animated counter component
function AnimatedCounter({
  value,
  suffix,
  label,
  delay,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div
        className="text-3xl font-bold md:text-4xl"
        style={{ color: "var(--accent)" }}
      >
        {count}
        {suffix}
      </div>
      <div
        className="font-technical mt-2 text-xs tracking-[0.15em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroImageY = useTransform(heroProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);

  return (
    <>
      {/* ═══ Parallax Hero ═══ */}
      <section ref={heroRef} className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <Image
            src="/about-cover.png"
            alt="Photographer at work"
            fill
            sizes="100vw"
            className="object-cover scale-110"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-transparent to-[var(--bg-primary)]" />

        {/* Title overlay */}
        <motion.div
          className="absolute inset-0 flex items-end"
          style={{ opacity: heroOpacity }}
        >
          <div className="container-abi pb-12">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-glow-orange text-4xl font-bold tracking-tight md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              About
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-technical mt-2 text-xs tracking-[0.2em]"
              style={{ color: "var(--accent)" }}
            >
              THE STORY BEHIND THE LENS
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ Stats counter bar ═══ */}
      <section
        className="relative overflow-hidden border-y"
        style={{
          padding: "3rem 0",
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="container-abi">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <AnimatedCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={i * 200}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bio section with staggered reveal ═══ */}
      <section style={{ padding: "var(--section-padding) 0" }}>
        <div className="container-abi">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Photo with 3D tilt */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl lg:aspect-auto"
            >
              <Image
                src="/abi.jpg"
                alt="Abishek.S — Photographer"
                width={800}
                height={1000}
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/30 to-transparent" />

              {/* Corner accents */}
              <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-[#E8632B]/40" />
              <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#E8632B]/40" />
            </motion.div>

            {/* Bio text */}
            <div className="flex flex-col justify-center gap-6">
              <motion.h2
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{
                  fontSize: "var(--text-2xl)",
                  color: "var(--text-primary)",
                }}
              >
                Abishek.S
              </motion.h2>
              <div className="flex flex-col gap-4">
                <motion.p
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="leading-relaxed"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  I&apos;m a photographer driven by the pursuit of the perfect
                  frame. Every shoot is an opportunity to tell a story — not
                  just capture an image. My work blends technical precision with
                  raw emotion, creating photographs that resonate long after the
                  moment has passed.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="leading-relaxed"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  From the bustling streets of the city to quiet, intimate
                  portrait sessions, I bring a cinematic eye to every project.
                  My approach is rooted in understanding light, composition,
                  and the authentic essence of every subject.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Philosophy with animated quote ═══ */}
      <section
        className="relative overflow-hidden"
        style={{
          padding: "var(--section-padding) 0",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,99,43,0.05)_0%,transparent_60%)]" />
        <div className="container-abi relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-serif leading-none"
            style={{ color: "var(--accent)" }}
          >
            &ldquo;
          </motion.div>

          <div
            className="font-technical mb-6 text-xs tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            PHILOSOPHY
          </div>
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-2xl text-2xl font-light italic leading-relaxed md:text-3xl"
            style={{
              fontSize: "var(--text-xl)",
              color: "var(--text-primary)",
            }}
          >
            &ldquo;{SITE.tagline}&rdquo;
          </motion.blockquote>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            — Abishek.S
          </motion.p>
        </div>
      </section>

      {/* ═══ Services with hover animations ═══ */}
      <section style={{ padding: "var(--section-padding) 0" }}>
        <div className="container-abi">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="font-technical text-sm tracking-[0.2em]"
              style={{ color: "var(--text-primary)" }}
            >
              SERVICES
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={cn(
                    "group flex flex-col gap-4 rounded-2xl p-6",
                    "glass-card"
                  )}
                >
                  <motion.div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    style={{
                      backgroundColor: `${service.color}15`,
                      color: service.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
