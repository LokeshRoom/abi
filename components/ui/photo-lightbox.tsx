"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoLightboxProps {
  photos: { src: string; title: string; category: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, goNext, goPrev]);

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ═══ Backdrop ═══ */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(5, 5, 5, 0.95)",
              backdropFilter: "blur(20px)",
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* ═══ Close button ═══ */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-6 right-6 z-[101] rounded-full p-3",
              "glass-card",
              "transition-all duration-300 hover:scale-110"
            )}
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
          </button>

          {/* ═══ Navigation arrows ═══ */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className={cn(
                  "absolute left-4 z-[101] rounded-full p-3 md:left-8",
                  "glass-card",
                  "transition-all duration-300 hover:scale-110"
                )}
                aria-label="Previous photo"
              >
                <ChevronLeft
                  className="h-6 w-6"
                  style={{ color: "var(--text-primary)" }}
                />
              </button>
              <button
                onClick={goNext}
                className={cn(
                  "absolute right-4 z-[101] rounded-full p-3 md:right-8",
                  "glass-card",
                  "transition-all duration-300 hover:scale-110"
                )}
                aria-label="Next photo"
              >
                <ChevronRight
                  className="h-6 w-6"
                  style={{ color: "var(--text-primary)" }}
                />
              </button>
            </>
          )}

          {/* ═══ Photo container ═══ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.src}
              className="relative z-[101] mx-auto max-h-[85vh] max-w-[90vw] overflow-hidden rounded-xl md:max-w-[80vw]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={photo.src}
                alt={photo.title}
                width={1200}
                height={800}
                className="h-auto max-h-[80vh] w-auto max-w-full object-contain"
                priority
              />

              {/* ═══ Photo info bar ═══ */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <span
                      className="font-technical text-[10px] tracking-[0.15em]"
                      style={{ color: "#E8632B" }}
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
                  <span
                    className="font-technical text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {currentIndex + 1} / {photos.length}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* ═══ Thumbnail strip ═══ */}
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-[101] flex -translate-x-1/2 gap-2">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(i)}
                  className={cn(
                    "h-12 w-12 overflow-hidden rounded-lg transition-all duration-300",
                    i === currentIndex
                      ? "ring-2 ring-[#E8632B] scale-110"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  <Image
                    src={p.src}
                    alt={p.title}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
