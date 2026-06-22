"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURED_PHOTOS = [
  {
    src: "/abishek_insta/007_DUV3jLtk-KY.jpg",
    title: "Aesthetic Portrait",
    category: "Portraits",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/abishek_insta/005_DWOW12mk6fz.jpg",
    title: "Cinematic Moods",
    category: "Cinematic",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/abishek_insta/002_DWyFIc6AbPy8HUv8dX26KPOB2Ft1pG9Zd3Fqts0.jpg",
    title: "Urban Framing",
    category: "Street",
    aspect: "aspect-[1/1]",
  },
  {
    src: "/abishek_insta/019_DLev6B6TS03.jpg",
    title: "Dramatic Contrast",
    category: "Cinematic",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/abishek_insta/012_DS4oJGMDHZS.jpg",
    title: "Soulful Expressions",
    category: "Portraits",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/abishek_insta/016_DOVi391k7UG.jpg",
    title: "Sunset Silhouette",
    category: "Nature",
    aspect: "aspect-[4/3]",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// 3D Tilt Card Component
function TiltCard({
  photo,
  index,
}: {
  photo: (typeof FEATURED_PHOTOS)[0];
  index: number;
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
      setTilt({ x: y * -15, y: x * 15 });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  // Alternate entry direction
  const slideDirection = index % 2 === 0 ? -60 : 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: slideDirection, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      className="perspective-container"
    >
      <div
        ref={cardRef}
        className={cn("group relative overflow-hidden rounded-xl", photo.aspect)}
        data-cursor="view"
        style={{
          backgroundColor: "var(--bg-card)",
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={photo.src}
          alt={photo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* ═══ Hover overlay with glassmorphism ═══ */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-6",
            "opacity-0 transition-all duration-500",
            "group-hover:opacity-100"
          )}
          style={{
            background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 50%, transparent 100%)",
          }}
        >
          {/* Category badge */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-2 inline-flex w-fit items-center rounded-full px-3 py-1",
              "font-technical text-[10px] tracking-[0.15em]"
            )}
            style={{
              backgroundColor: "rgba(232, 99, 43, 0.2)",
              color: "#E8632B",
              border: "1px solid rgba(232, 99, 43, 0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            {photo.category.toUpperCase()}
          </motion.span>
          <h3
            className="text-lg font-semibold tracking-tight"
            style={{ color: "#FAFAFA" }}
          >
            {photo.title}
          </h3>
        </div>

        {/* ═══ Corner accents ═══ */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-[#E8632B]" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#E8632B]" />
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.3], [60, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={sectionRef} style={{ padding: "var(--section-padding) 0" }}>
      <div className="container-abi">
        {/* ═══ Section title with scroll reveal ═══ */}
        <motion.div
          className="viewfinder-corner mb-16 inline-block px-4 py-2"
          style={{ y: headingY, opacity: headingOpacity }}
        >
          <h2
            className="font-technical text-sm tracking-[0.2em]"
            style={{ color: "var(--text-primary)" }}
          >
            SELECTED WORK
          </h2>
        </motion.div>

        {/* ═══ Masonry photo grid with 3D tilt ═══ */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {FEATURED_PHOTOS.map((photo, i) => (
            <div key={photo.title} className="mb-4 break-inside-avoid">
              <TiltCard photo={photo} index={i} />
            </div>
          ))}
        </div>

        {/* ═══ View all link ═══ */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/portfolio"
            className={cn(
              "group inline-flex items-center gap-3 rounded-full px-8 py-3",
              "text-sm font-medium tracking-wide",
              "glass-card",
              "hover:scale-105 active:scale-95",
              "transition-transform duration-[var(--transition-base)]"
            )}
            style={{ color: "var(--text-secondary)" }}
          >
            <span>View All Work</span>
            <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
