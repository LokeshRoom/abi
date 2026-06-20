"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
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

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
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
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % TESTIMONIALS.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, scrollToIndex]);

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
      style={{
        padding: "var(--section-padding) 0",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="container-abi">
        {/* ═══ Section title ═══ */}
        <div className="mb-12 text-center">
          <h2
            className="font-technical text-sm tracking-[0.2em]"
            style={{ color: "var(--text-primary)" }}
          >
            CLIENT STORIES
          </h2>
        </div>
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
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            data-card
            className={cn(
              "flex w-[85vw] max-w-[420px] shrink-0 snap-center flex-col justify-between gap-6",
              "rounded-xl border p-6 md:p-8",
              "transition-all duration-[var(--transition-base)]",
              "hover:border-[var(--border-hover)] hover:shadow-[0_0_20px_var(--accent-glow)]"
            )}
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            {/* Stars */}
            <div
              className="flex gap-1 text-sm"
              style={{ color: "var(--accent)" }}
            >
              {Array.from({ length: t.rating }).map((_, j) => (
                <span key={j}>★</span>
              ))}
            </div>

            {/* Quote */}
            <p
              className="flex-1 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Attribution */}
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {t.name}
              </p>
              <p
                className="font-technical text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Dot indicators ═══ */}
      <div className="mt-8 flex justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i);
              scrollToIndex(i);
            }}
            aria-label={`Go to testimonial ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-[var(--transition-base)]",
              i === activeIndex ? "w-6" : "w-2"
            )}
            style={{
              backgroundColor:
                i === activeIndex
                  ? "var(--accent)"
                  : "var(--border)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
