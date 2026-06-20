"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FEATURED_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    title: "Mountain Solitude",
    category: "Nature",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    title: "Golden Hour Valley",
    category: "Nature",
  },
  {
    src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop",
    title: "Street Moment",
    category: "Street",
  },
  {
    src: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=600&fit=crop",
    title: "Light & Shadow",
    category: "Portraits",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
    title: "Lakeside Dawn",
    category: "Cinematic",
  },
  {
    src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop",
    title: "Urban Portraits",
    category: "Portraits",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturedWork() {
  return (
    <section style={{ padding: "var(--section-padding) 0" }}>
      <div className="container-abi">
        {/* ═══ Section title ═══ */}
        <div className="viewfinder-corner mb-12 inline-block px-4 py-2">
          <h2
            className="font-technical text-sm tracking-[0.2em]"
            style={{ color: "var(--text-primary)" }}
          >
            SELECTED WORK
          </h2>
        </div>

        {/* ═══ Photo grid ═══ */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURED_PHOTOS.map((photo) => (
            <motion.div
              key={photo.title}
              variants={cardVariants}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[var(--transition-cinematic)] group-hover:scale-105"
              />

              {/* ═══ Hover overlay ═══ */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col justify-end p-5",
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
                  className="text-lg font-semibold"
                  style={{ color: "#FAFAFA" }}
                >
                  {photo.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ View all link ═══ */}
        <div className="mt-12 text-center">
          <Link
            href="/portfolio"
            className={cn(
              "group inline-flex items-center gap-2 text-sm font-medium tracking-wide",
              "transition-colors duration-[var(--transition-base)]",
              "hover:text-[var(--accent)]"
            )}
            style={{ color: "var(--text-secondary)" }}
          >
            View All Work
            <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
