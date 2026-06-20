"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Photo {
  src: string;
  title: string;
  category: string;
}

const PORTFOLIO_PHOTOS: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    title: "Mountain Solitude",
    category: "nature",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    title: "Golden Hour Valley",
    category: "nature",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
    title: "Lakeside Dawn",
    category: "cinematic",
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
    title: "Misty Forest",
    category: "nature",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    title: "Forest Canopy",
    category: "nature",
  },
  {
    src: "https://images.unsplash.com/photo-1518173946687-a1e019b1cb52?w=800&h=600&fit=crop",
    title: "City Lights",
    category: "events",
  },
  {
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop",
    title: "Street Moment",
    category: "street",
  },
  {
    src: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=600&fit=crop",
    title: "Light & Shadow",
    category: "portraits",
  },
  {
    src: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&h=600&fit=crop",
    title: "Focused",
    category: "portraits",
  },
  {
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
    title: "Behind the Lens",
    category: "cinematic",
  },
  {
    src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
    title: "Urban Portraits",
    category: "portraits",
  },
  {
    src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=600&fit=crop",
    title: "Gentle Morning",
    category: "cinematic",
  },
];

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? PORTFOLIO_PHOTOS
      : PORTFOLIO_PHOTOS.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* ═══ Category tabs ═══ */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              "font-technical rounded-full border px-5 py-2 text-xs tracking-[0.1em]",
              "transition-all duration-[var(--transition-base)]",
              activeCategory === cat.slug
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg-primary)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ═══ Photo grid ═══ */}
      <motion.div
        layout
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((photo) => (
            <motion.div
              key={photo.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-[var(--transition-cinematic)] group-hover:scale-105"
              />

              {/* ═══ Hover overlay ═══ */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col justify-end p-4",
                  "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                  "opacity-0 transition-opacity duration-[var(--transition-base)]",
                  "group-hover:opacity-100"
                )}
              >
                <span
                  className="font-technical text-[10px] tracking-[0.15em]"
                  style={{ color: "var(--accent)" }}
                >
                  {photo.category.toUpperCase()}
                </span>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "#FAFAFA" }}
                >
                  {photo.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
