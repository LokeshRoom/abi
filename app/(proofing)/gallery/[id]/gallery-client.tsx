"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  MessageSquare,
  CheckCircle,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  title: string | null;
  description: string | null;
  blobUrl: string;
  blurDataUrl: string | null;
  width: number;
  height: number;
}

interface Selection {
  photoId: string;
  note: string | null;
}

interface GalleryClientProps {
  gallery: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    photos: Photo[];
  };
  initialSelections: Selection[];
}

export function GalleryClient({ gallery, initialSelections }: GalleryClientProps) {
  // Map of selections by photo ID for fast lookup and state management
  const [selections, setSelections] = useState<Record<string, { selected: boolean; note: string | null }>>(() => {
    const initial: Record<string, { selected: boolean; note: string | null }> = {};
    gallery.photos.forEach((photo) => {
      initial[photo.id] = { selected: false, note: null };
    });
    initialSelections.forEach((sel) => {
      initial[sel.photoId] = { selected: true, note: sel.note };
    });
    return initial;
  });

  const [filter, setFilter] = useState<"all" | "selected">("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  // Note editing state in lightbox
  const [editingNote, setEditingNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Statistics
  const selectedPhotosCount = useMemo(() => {
    return Object.values(selections).filter((s) => s.selected).length;
  }, [selections]);

  const filteredPhotos = useMemo(() => {
    if (filter === "selected") {
      return gallery.photos.filter((p) => selections[p.id]?.selected);
    }
    return gallery.photos;
  }, [gallery.photos, filter, selections]);

  // Handle toggling selection
  const handleToggleSelection = async (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update
    setSelections((prev) => {
      const current = prev[photoId];
      return {
        ...prev,
        [photoId]: {
          selected: !current.selected,
          note: current.note,
        },
      };
    });

    try {
      const res = await fetch("/api/gallery/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
      if (!res.ok) {
        throw new Error("Failed to save selection");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setSelections((prev) => {
        const current = prev[photoId];
        return {
          ...prev,
          [photoId]: {
            selected: !current.selected,
            note: current.note,
          },
        };
      });
    }
  };

  // Handle saving note
  const handleSaveNote = async (photoId: string) => {
    setSavingNote(true);
    setNoteSaved(false);

    try {
      const res = await fetch("/api/gallery/selection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, note: editingNote }),
      });
      
      if (!res.ok) throw new Error("Failed to save note");
      
      const data = await res.json();
      
      setSelections((prev) => ({
        ...prev,
        [photoId]: {
          selected: true, // Upsert in API auto-selects if it wasn't
          note: data.note,
        },
      }));
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  // Open Lightbox
  const handleOpenLightbox = (index: number) => {
    const photo = filteredPhotos[index];
    setActivePhotoIndex(index);
    setEditingNote(selections[photo.id]?.note || "");
    setLightboxOpen(true);
  };

  // Navigate Lightbox
  const handleNavigateLightbox = (direction: "prev" | "next") => {
    let nextIndex = activePhotoIndex;
    if (direction === "prev") {
      nextIndex = activePhotoIndex > 0 ? activePhotoIndex - 1 : filteredPhotos.length - 1;
    } else {
      nextIndex = activePhotoIndex < filteredPhotos.length - 1 ? activePhotoIndex + 1 : 0;
    }
    
    const photo = filteredPhotos[nextIndex];
    setActivePhotoIndex(nextIndex);
    setEditingNote(selections[photo.id]?.note || "");
    setNoteSaved(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--bg-primary)]">
      {/* ═══ Top Control Bar ═══ */}
      <div className="sticky top-16 z-30 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border)] py-4">
        <div className="container-abi flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/gallery"
              className="p-2 rounded-full border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{gallery.title}</h1>
              <p className="text-xs text-[var(--text-secondary)]">{gallery.photos.length} photos in gallery</p>
            </div>
          </div>

          {/* Progress and Filtering */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 self-stretch md:self-auto">
            {/* Selection Counter & Progress Bar */}
            <div className="flex flex-col w-full sm:w-48 gap-1">
              <div className="flex items-center justify-between text-xs font-technical">
                <span>SELECTIONS</span>
                <span className="text-[var(--accent)] font-bold">
                  {selectedPhotosCount} / {gallery.photos.length}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border)]">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                  style={{ width: `${(selectedPhotosCount / gallery.photos.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-technical rounded-md transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-[var(--accent)] text-[var(--bg-primary)] font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                ALL PHOTOS
              </button>
              <button
                onClick={() => setFilter("selected")}
                className={cn(
                  "flex-1 sm:flex-initial px-4 py-1.5 text-xs font-technical rounded-md transition-all cursor-pointer",
                  filter === "selected"
                    ? "bg-[var(--accent)] text-[var(--bg-primary)] font-bold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                SELECTED ({selectedPhotosCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Gallery Grid ═══ */}
      <div className="flex-1 container-abi py-8">
        {filteredPhotos.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => {
                const isSelected = selections[photo.id]?.selected;
                const hasNote = !!selections[photo.id]?.note;

                return (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleOpenLightbox(index)}
                    className={cn(
                      "group relative aspect-[3/2] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-[var(--bg-card)] border",
                      isSelected
                        ? "border-[var(--accent)] shadow-[0_0_20px_rgba(232,99,43,0.15)] scale-[1.01]"
                        : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    <Image
                      src={photo.blobUrl}
                      alt={photo.title || "Gallery photo"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      placeholder={photo.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={photo.blurDataUrl || undefined}
                    />

                    {/* Checkbox overlay always visible when selected */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10 bg-[var(--accent)] text-[var(--bg-primary)] p-1 rounded-full shadow-lg">
                        <Heart size={14} className="fill-current" />
                      </div>
                    )}

                    {/* Note indicator badge */}
                    {hasNote && (
                      <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-[var(--accent)] p-1.5 rounded-full border border-[var(--border)]">
                        <MessageSquare size={12} />
                      </div>
                    )}

                    {/* Card Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                      {/* Top Action inside overlay */}
                      <button
                        onClick={(e) => handleToggleSelection(photo.id, e)}
                        className={cn(
                          "self-end p-2 rounded-full backdrop-blur-md border transition-all duration-300",
                          isSelected
                            ? "bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)]"
                            : "bg-black/50 text-[#FAFAFA] border-white/20 hover:scale-110"
                        )}
                      >
                        <Heart size={16} className={cn(isSelected && "fill-current")} />
                      </button>

                      {/* Bottom Info inside overlay */}
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-semibold truncate max-w-[70%]">
                          {photo.title || `Photo ${index + 1}`}
                        </span>
                        {hasNote && (
                          <span className="text-xs text-[var(--accent)] flex items-center gap-1">
                            <MessageSquare size={12} /> Note Added
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-card)] max-w-md mx-auto">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            <h2 className="text-lg font-bold mb-1">No Selected Photos</h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
              {filter === "selected"
                ? "You haven't selected any photos yet. Switch to ALL PHOTOS and heart the images you like."
                : "This gallery is currently empty."}
            </p>
          </div>
        )}
      </div>

      {/* ═══ Proofing Lightbox Modal ═══ */}
      <AnimatePresence>
        {lightboxOpen && filteredPhotos[activePhotoIndex] && (() => {
          const photo = filteredPhotos[activePhotoIndex];
          const isSelected = selections[photo.id]?.selected;

          return (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[var(--bg-primary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close Button (Top right overlay) */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full glass-card hover:scale-110 transition-transform cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Photo Area (Left/Main section) */}
              <div className="flex-1 relative flex items-center justify-center p-6 md:p-12 border-b md:border-b-0 md:border-r border-[var(--border)] min-h-[50vh] md:min-h-0">
                <div className="relative max-h-[70vh] max-w-[80vw] aspect-[3/2] w-full h-full">
                  <Image
                    src={photo.blobUrl}
                    alt={photo.title || "Proofing photo"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority
                  />
                </div>

                {/* Left/Right Navigation Arrows */}
                {filteredPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => handleNavigateLightbox("prev")}
                      className="absolute left-4 p-3 rounded-full glass-card hover:scale-110 transition-transform cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => handleNavigateLightbox("next")}
                      className="absolute right-4 p-3 rounded-full glass-card hover:scale-110 transition-transform cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Control Panel / Notes Area (Right sidebar) */}
              <div className="w-full md:w-96 bg-[var(--bg-card)] p-8 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  {/* Photo Index */}
                  <div className="font-technical text-[10px] text-[var(--text-muted)] tracking-widest">
                    PHOTO {activePhotoIndex + 1} OF {filteredPhotos.length}
                  </div>

                  {/* Photo Title */}
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {photo.title || `Photo ${activePhotoIndex + 1}`}
                    </h2>
                    {photo.description && (
                      <p className="text-sm text-[var(--text-secondary)]">{photo.description}</p>
                    )}
                  </div>

                  {/* Selection Button */}
                  <button
                    onClick={() => handleToggleSelection(photo.id)}
                    className={cn(
                      "w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 border cursor-pointer",
                      isSelected
                        ? "bg-[var(--accent)] text-[var(--bg-primary)] border-[var(--accent)] hover:shadow-[0_0_20px_rgba(232,99,43,0.3)]"
                        : "bg-transparent border-[var(--border)] text-[#FAFAFA] hover:border-[var(--accent)]"
                    )}
                  >
                    <Heart size={18} className={cn(isSelected && "fill-current")} />
                    <span>{isSelected ? "PHOTO SELECTED" : "SELECT THIS PHOTO"}</span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-[var(--border)]" />

                  {/* Client Notes / Comments */}
                  <div className="space-y-3">
                    <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-widest">
                      FEEDBACK & REQUESTS
                    </label>
                    <textarea
                      value={editingNote}
                      onChange={(e) => {
                        setEditingNote(e.target.value);
                        setNoteSaved(false);
                      }}
                      placeholder="Add retouching notes or comments for this photo (e.g., 'Crop closer', 'Fix lighting' etc.)"
                      className="w-full h-32 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none placeholder-[var(--text-muted)]"
                    />

                    <div className="flex items-center justify-between gap-4">
                      {/* Save Status indicators */}
                      <div className="text-xs font-technical">
                        {savingNote && <span className="text-[var(--text-muted)]">Saving...</span>}
                        {noteSaved && (
                          <span className="text-[var(--accent-secondary)] flex items-center gap-1">
                            <CheckCircle size={12} /> Notes Saved
                          </span>
                        )}
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveNote(photo.id)}
                        disabled={savingNote}
                        className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-xs font-technical font-semibold rounded-lg disabled:opacity-55 cursor-pointer"
                      >
                        {savingNote ? "SAVING..." : "SAVE NOTE"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts indicator */}
                <div className="mt-8 pt-6 border-t border-[var(--border)] text-[10px] font-technical text-[var(--text-muted)] flex justify-between">
                  <span>← / → NAVIGATE</span>
                  <span>ESC CLOSE</span>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
