"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Camera, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  title: string | null;
  blobUrl: string;
  blurDataUrl: string | null;
  width: number;
  height: number;
}

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  photos: Photo[];
}

export default function GalleryDetailClient({ gallery: initialGallery }: { gallery: Gallery }) {
  const [gallery, setGallery] = useState<Gallery>(initialGallery);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg("");
    setUploadStatus(`Uploading ${files.length} photo(s)...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadStatus(`Uploading photo ${i + 1} of ${files.length}: ${file.name}`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("galleryId", gallery.id);
        formData.append("isPublic", gallery.isPublic ? "true" : "false");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        
        // Append uploaded photo to local state
        setGallery((prev) => ({
          ...prev,
          photos: [...prev.photos, data.photo],
        }));
      }

      setUploadStatus("All photos uploaded successfully!");
      setTimeout(() => setUploadStatus(""), 3000);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error uploading photos. Verify Vercel Blob token config.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      setGallery((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
      }));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error deleting photo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/galleries"
        className="flex items-center gap-1.5 text-xs font-technical text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        <span>BACK TO GALLERIES</span>
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl font-bold mb-2">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-[var(--text-secondary)] text-sm mb-2">{gallery.description}</p>
          )}
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-technical ${
                gallery.isPublic
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}
            >
              {gallery.isPublic ? "PUBLIC GALLERY" : "PRIVATE GALLERY"}
            </span>
            <span className="text-[var(--text-muted)] text-xs font-technical">
              {gallery.photos.length} PHOTOS TOTAL
            </span>
          </div>
        </div>

        {/* Upload Button */}
        <div className="shrink-0">
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_20px_var(--accent-glow)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            <span>{uploading ? "Uploading..." : "Upload Photos"}</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadStatus && (
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--accent)]/30 text-[var(--text-primary)] rounded-xl flex items-center gap-3 mb-6 animate-pulse">
          <Sparkles className="text-[var(--accent)]" size={20} />
          <p className="text-sm font-semibold">{uploadStatus}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)] relative aspect-[3/2]"
          >
            <Image
              src={photo.blobUrl}
              alt={photo.title || "Gallery photo"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-cover"
              placeholder={photo.blurDataUrl ? "blur" : "empty"}
              blurDataURL={photo.blurDataUrl || undefined}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end p-4">
              <span className="text-white text-xs font-medium truncate max-w-[150px]">
                {photo.title || "Untitled"}
              </span>
              <button
                disabled={deletingId === photo.id}
                onClick={() => handleDeletePhoto(photo.id)}
                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                {deletingId === photo.id ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          </div>
        ))}

        {gallery.photos.length === 0 && (
          <div className="col-span-full border border-dashed border-[var(--border)] rounded-xl p-16 text-center text-[var(--text-muted)] font-technical">
            <Camera className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            THIS GALLERY IS EMPTY. UPLOAD PHOTOS TO GET STARTED.
          </div>
        )}
      </div>
    </div>
  );
}
