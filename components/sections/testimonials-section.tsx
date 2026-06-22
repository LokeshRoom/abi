"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Abi captured our wedding day with such artistry. Every frame tells a story we'll cherish forever. His eye for those fleeting, candid moments is truly extraordinary.",
    name: "Priya & Karthik",
    role: "Wedding Client",
    rating: 5,
  },
  {
    quote:
      "The portrait session exceeded all expectations. The lighting, composition, and post-processing were absolutely flawless. I've never felt more confident in photos.",
    name: "Deepa Ramasamy",
    role: "Portrait Client",
    rating: 5,
  },
  {
    quote:
      "Working with Abi on our brand campaign was seamless. He understood our vision instantly and delivered images that elevated our entire brand identity.",
    name: "Arjun Menon",
    role: "Creative Director, Lunar Co.",
    rating: 5,
  },
  {
    quote:
      "His cinematic approach to event photography is unmatched. Every photo feels like a still from a film — dramatic, emotional, and perfectly timed.",
    name: "Meera Suresh",
    role: "Event Organizer",
    rating: 5,
  },
];

// Animated star component
function AnimatedStar({ delay, filled }: { delay: number; filled: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      className="inline-block"
      style={{ color: filled ? "#E8632B" : "var(--border)" }}
    >
      ★
    </motion.span>
  );
}

// Individual testimonial card
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -8, y: x * 8 });
    },
    []
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={cn(
        "group flex flex-col justify-between gap-6",
        "rounded-2xl p-8",
        "glass-card",
        "min-w-[320px] max-w-[420px] shrink-0 snap-center"
      )}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* ═══ Giant quote mark ═══ */}
      <div
        className="font-serif text-5xl leading-none opacity-20"
        style={{ color: "var(--accent)" }}
      >
        &ldquo;
      </div>

      {/* ═══ Stars ═══ */}
      <div className="flex gap-1.5 text-sm">
        {Array.from({ length: 5 }).map((_, j) => (
          <AnimatedStar
            key={j}
            delay={index * 0.15 + j * 0.08}
            filled={j < testimonial.rating}
          />
        ))}
      </div>

      {/* ═══ Quote ═══ */}
      <p
        className="flex-1 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {testimonial.quote}
      </p>

      {/* ═══ Attribution ═══ */}
      <div className="flex items-center gap-3">
        {/* Avatar placeholder with gradient */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{
            background:
              "linear-gradient(135deg, rgba(232,99,43,0.3), rgba(59,93,170,0.3))",
            color: "var(--text-primary)",
          }}
        >
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {testimonial.name}
          </p>
          <p
            className="font-technical text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {testimonial.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const featuredData = data
              .filter((t: any) => t.featured)
              .map((t: any) => ({
                quote: t.content,
                name: t.name,
                role: t.role || "Client",
                rating: t.rating,
              }));

            if (featuredData.length > 0) {
              setTestimonials(featuredData);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
      }
      setTestimonials(DEFAULT_TESTIMONIALS);
    }
    loadTestimonials();
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container || testimonials.length === 0) return;
      const cards = container.querySelectorAll<HTMLElement>("[data-card]");
      if (cards[index]) {
        const cardLeft = cards[index].offsetLeft;
        const containerWidth = container.offsetWidth;
        const cardWidth = cards[index].offsetWidth;
        container.scrollTo({
          left: cardLeft - containerWidth / 2 + cardWidth / 2,
          behavior: "smooth",
        });
      }
    },
    [testimonials]
  );

  // Auto-scroll
  useEffect(() => {
    if (isPaused || testimonials.length === 0) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % testimonials.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, scrollToIndex, testimonials.length]);

  // Track scroll position to update dots
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const cards = container.querySelectorAll<HTMLElement>("[data-card]");
      const containerCenter = container.scrollLeft + container.offsetWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(containerCenter - cardCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "var(--section-padding) 0",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      {/* ═══ Background decorations ═══ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(232,99,43,0.04)_0%,transparent_70%)]" />
        <div className="absolute right-[15%] bottom-[15%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(59,93,170,0.04)_0%,transparent_70%)]" />
      </div>

      <div className="container-abi relative z-10">
        {/* ═══ Section title ═══ */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-technical text-sm tracking-[0.2em]"
            style={{ color: "var(--text-primary)" }}
          >
            CLIENT STORIES
          </h2>
          <motion.div
            className="mx-auto mt-4 h-px w-16"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
        </motion.div>
      </div>

      {/* ═══ Horizontal scroll ═══ */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-var(--container-max))/2+1rem))]"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {testimonials.map((t, i) => (
          <div key={i} data-card>
            <TestimonialCard testimonial={t} index={i} />
          </div>
        ))}
      </div>

      {/* ═══ Dot indicators ═══ */}
      <div className="mt-10 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i);
              scrollToIndex(i);
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              i === activeIndex ? "w-8" : "w-2"
            )}
            style={{
              backgroundColor:
                i === activeIndex ? "var(--accent)" : "var(--border)",
              boxShadow:
                i === activeIndex
                  ? "0 0 12px rgba(232, 99, 43, 0.4)"
                  : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}
