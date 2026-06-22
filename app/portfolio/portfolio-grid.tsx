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
    src: "/abishek_insta/002_DWyFIc6AbPy8HUv8dX26KPOB2Ft1pG9Zd3Fqts0.jpg",
    title: "Urban Framing",
    category: "street",
  },
  {
    src: "/abishek_insta/004_DWUGuXMEylp.jpg",
    title: "Golden Horizon",
    category: "nature",
  },
  {
    src: "/abishek_insta/005_DWOW12mk6fz.jpg",
    title: "Cinematic Moods",
    category: "cinematic",
  },
  {
    src: "/abishek_insta/007_DUV3jLtk-KY.jpg",
    title: "Aesthetic Portrait",
    category: "portraits",
  },
  {
    src: "/abishek_insta/008_DT4oLJrkwQG.jpg",
    title: "Wilderness Path",
    category: "nature",
  },
  {
    src: "/abishek_insta/009_DTzd16sk0lQ.jpg",
    title: "City Life",
    category: "street",
  },
  {
    src: "/abishek_insta/010_DTRzA49E1dJ.jpg",
    title: "Chasing Shadows",
    category: "cinematic",
  },
  {
    src: "/abishek_insta/011_DTQLVn2k1oJ.jpg",
    title: "Traditional Gatherings",
    category: "events",
  },
  {
    src: "/abishek_insta/012_DS4oJGMDHZS.jpg",
    title: "Soulful Expressions",
    category: "portraits",
  },
  {
    src: "/abishek_insta/013_DS4lxUBkr-8.jpg",
    title: "Devotion Rituals",
    category: "events",
  },
  {
    src: "/abishek_insta/014_DScZ6BTk5KF.jpg",
    title: "Sacred Moments",
    category: "events",
  },
  {
    src: "/abishek_insta/015_DOse3DZE5Hw.jpg",
    title: "Studio Portraits",
    category: "portraits",
  },
  {
    src: "/abishek_insta/016_DOVi391k7UG.jpg",
    title: "Sunset Silhouette",
    category: "cinematic",
  },
  {
    src: "/abishek_insta/017_DL-EYZNTmSo.jpg",
    title: "Natural Elegance",
    category: "nature",
  },
  {
    src: "/abishek_insta/018_DL31iL4Ta8T.jpg",
    title: "Street Perspective",
    category: "street",
  },
  {
    src: "/abishek_insta/019_DLev6B6TS03.jpg",
    title: "Dramatic Contrast",
    category: "cinematic",
  },
  {
    src: "/abishek_insta/021_DLYFdyvzxly.jpg",
    title: "Monochrome Portrait",
    category: "portraits",
  },
  {
    src: "/abishek_insta/022_DKoUUeOzntu.jpg",
    title: "Urban Exploration",
    category: "street",
  },
  {
    src: "/abishek_insta/023_DJ6K5mpTcmC.jpg",
    title: "Vibrant Greens",
    category: "nature",
  },
  {
    src: "/abishek_insta/024_DJRjcKczLtf.jpg",
    title: "Festive Vibes",
    category: "events",
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
