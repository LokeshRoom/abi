"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";

interface Photo {
  src: string;
  title: string;
  category: string;
}

const PORTFOLIO_PHOTOS: Photo[] = [
  { src: "/abishek_insta/002_DWyFIc6AbPy8HUv8dX26KPOB2Ft1pG9Zd3Fqts0.jpg", title: "Urban Framing", category: "street" },
  { src: "/abishek_insta/004_DWUGuXMEylp.jpg", title: "Golden Horizon", category: "nature" },
  { src: "/abishek_insta/005_DWOW12mk6fz.jpg", title: "Cinematic Moods", category: "cinematic" },
  { src: "/abishek_insta/007_DUV3jLtk-KY.jpg", title: "Aesthetic Portrait", category: "portraits" },
  { src: "/abishek_insta/008_DT4oLJrkwQG.jpg", title: "Wilderness Path", category: "nature" },
  { src: "/abishek_insta/009_DTzd16sk0lQ.jpg", title: "City Life", category: "street" },
  { src: "/abishek_insta/010_DTRzA49E1dJ.jpg", title: "Chasing Shadows", category: "cinematic" },
  { src: "/abishek_insta/011_DTQLVn2k1oJ.jpg", title: "Traditional Gatherings", category: "events" },
  { src: "/abishek_insta/012_DS4oJGMDHZS.jpg", title: "Soulful Expressions", category: "portraits" },
  { src: "/abishek_insta/013_DS4lxUBkr-8.jpg", title: "Devotion Rituals", category: "events" },
  { src: "/abishek_insta/014_DScZ6BTk5KF.jpg", title: "Sacred Moments", category: "events" },
  { src: "/abishek_insta/015_DOse3DZE5Hw.jpg", title: "Studio Portraits", category: "portraits" },
  { src: "/abishek_insta/016_DOVi391k7UG.jpg", title: "Sunset Silhouette", category: "cinematic" },
  { src: "/abishek_insta/017_DL-EYZNTmSo.jpg", title: "Natural Elegance", category: "nature" },
  { src: "/abishek_insta/018_DL31iL4Ta8T.jpg", title: "Street Perspective", category: "street" },
  { src: "/abishek_insta/019_DLev6B6TS03.jpg", title: "Dramatic Contrast", category: "cinematic" },
  { src: "/abishek_insta/021_DLYFdyvzxly.jpg", title: "Monochrome Portrait", category: "portraits" },
  { src: "/abishek_insta/022_DKoUUeOzntu.jpg", title: "Urban Exploration", category: "street" },
  { src: "/abishek_insta/023_DJ6K5mpTcmC.jpg", title: "Vibrant Greens", category: "nature" },
  { src: "/abishek_insta/024_DJRjcKczLtf.jpg", title: "Festive Vibes", category: "events" },
];

// 3D Tilt photo card
function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: Photo;
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -12, y: x * 12 });
    },
    []
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className="break-inside-avoid mb-4"
    >
      <div
        ref={cardRef}
        className="group relative cursor-pointer overflow-hidden rounded-xl"
        data-cursor="view"
        style={{
          backgroundColor: "var(--bg-card)",
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.03 : 1})`,
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setTilt({ x: 0, y: 0 });
          setIsHovered(false);
        }}
      >
        <Image
          src={photo.src}
          alt={photo.title}
          width={600}
          height={450}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* ═══ Hover overlay ═══ */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-5",
            "opacity-0 transition-all duration-500",
            "group-hover:opacity-100"
          )}
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 40%, transparent 100%)",
          }}
        >
          <span
            className={cn(
              "mb-1.5 inline-flex w-fit items-center rounded-full px-2.5 py-0.5",
              "font-technical text-[9px] tracking-[0.15em]"
            )}
            style={{
              backgroundColor: "rgba(232, 99, 43, 0.2)",
              color: "#E8632B",
              border: "1px solid rgba(232, 99, 43, 0.3)",
              backdropFilter: "blur(8px)",
            }}
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

        {/* ═══ Corner accents ═══ */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute top-3 left-3 h-4 w-4 border-t border-l border-[#E8632B]/60" />
          <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#E8632B]/60" />
        </div>
      </div>
    </motion.div>
  );
}

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered =
    activeCategory === "all"
      ? PORTFOLIO_PHOTOS
      : PORTFOLIO_PHOTOS.filter((p) => p.category === activeCategory);

  const handlePhotoClick = useCallback(
    (index: number) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
    },
    []
  );

  return (
    <>
      {/* ═══ Category tabs ═══ */}
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "font-technical rounded-full px-5 py-2.5 text-xs tracking-[0.1em]",
              "transition-all duration-400",
              activeCategory === cat.slug
                ? "shadow-[0_0_20px_rgba(232,99,43,0.3)]"
                : "hover:bg-[var(--bg-card)]"
            )}
            style={{
              backgroundColor:
                activeCategory === cat.slug
                  ? "var(--accent)"
                  : "transparent",
              color:
                activeCategory === cat.slug
                  ? "var(--bg-primary)"
                  : "var(--text-secondary)",
              border: `1px solid ${
                activeCategory === cat.slug
                  ? "var(--accent)"
                  : "var(--border)"
              }`,
            }}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* ═══ Masonry photo grid ═══ */}
      <motion.div layout className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <PhotoCard
              key={photo.src}
              photo={photo}
              index={i}
              onClick={() => handlePhotoClick(i)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ═══ Lightbox ═══ */}
      <PhotoLightbox
        photos={filtered}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
