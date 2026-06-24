"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, Trash2, Camera, Sparkles, AlertCircle, RefreshCw, Users, CheckCircle, Clock, Download } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
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

interface ClientAccess {
  id: string;
  userId: string;
  submitted: boolean;
  submittedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PhotoSelection {
  id: string;
  userId: string;
  photoId: string;
  note: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  photo: {
    id: string;
    title: string | null;
    blobUrl: string;
  };
}

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  photos: Photo[];
  access: ClientAccess[];
}

export default function GalleryDetailClient({
  gallery: initialGallery,
  selections = [],
}: {
  gallery: Gallery;
  selections?: PhotoSelection[];
}) {
  const [gallery, setGallery] = useState<Gallery>(initialGallery);
  const [activeTab, setActiveTab] = useState<"photos" | "selections">("photos");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleExportCSV = (clientName: string, clientSelections: PhotoSelection[]) => {
    // CSV headers
    const headers = ["Photo Title", "Image Link", "Retouching Comment", "Date Selected"];
    
    const escapeCSV = (val: string) => {
      if (val === null || val === undefined) return '""';
      const formatted = val.toString().replace(/"/g, '""');
      return `"${formatted}"`;
    };

    // CSV rows
    const rows = clientSelections.map(sel => [
      escapeCSV(sel.photo.title || "Untitled Photo"),
      escapeCSV(sel.photo.blobUrl),
      escapeCSV(sel.note || ""),
      escapeCSV(new Date(sel.createdAt).toLocaleString())
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create blob with UTF-8 BOM to ensure Excel opens special characters correctly
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Safe file name: e.g. "aditi_wedding_lokesh_selections.csv"
    const safeGalleryTitle = gallery.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeClientName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeGalleryTitle}_${safeClientName}_selections.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
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
        {activeTab === "photos" && (
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
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-8 gap-6">
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "photos"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Photos Grid ({gallery.photos.length})
        </button>
        <button
          onClick={() => setActiveTab("selections")}
          className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "selections"
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Client Selections & Notes
        </button>
      </div>

      {/* Upload Feedback */}
      {uploadStatus && activeTab === "photos" && (
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--accent)]/30 text-[var(--text-primary)] rounded-xl flex items-center gap-3 mb-6 animate-pulse">
          <Sparkles className="text-[var(--accent)]" size={20} />
          <p className="text-sm font-semibold">{uploadStatus}</p>
        </div>
      )}

      {errorMsg && activeTab === "photos" && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Photos Tab Content */}
      {activeTab === "photos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {gallery.photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden group hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)] relative aspect-[3/2]"
            >
              <MediaImage
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
      )}

      {/* Selections Tab Content */}
      {activeTab === "selections" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {gallery.access && gallery.access.length > 0 ? (
            gallery.access.map((acc) => {
              const clientSelections = selections.filter((sel) => sel.userId === acc.userId);

              return (
                <div
                  key={acc.id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 space-y-6"
                >
                  {/* Client Header Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/60">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users size={18} className="text-[var(--accent)]" />
                        {acc.user.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-technical mt-0.5">
                        {acc.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {clientSelections.length > 0 && (
                        <button
                          onClick={() => handleExportCSV(acc.user.name, clientSelections)}
                          className="px-3 py-1.5 rounded bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[10px] font-technical font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                        >
                          <Download size={12} />
                          EXPORT EXCEL (CSV)
                        </button>
                      )}
                      {acc.submitted ? (
                        <div className="flex flex-col items-end">
                          <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-technical font-bold flex items-center gap-1.5 select-none">
                            <CheckCircle size={10} />
                            SUBMITTED & LOCKED
                          </span>
                          {acc.submittedAt && (
                            <span className="text-[10px] text-[var(--text-muted)] mt-1 font-technical flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(acc.submittedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-technical font-bold flex items-center gap-1.5 select-none">
                          <Clock size={10} />
                          PENDING SELECTIONS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client Selections List */}
                  <div>
                    <h4 className="text-xs font-technical text-[var(--text-secondary)] tracking-widest mb-4">
                      SELECTED PHOTOS ({clientSelections.length})
                    </h4>

                    {clientSelections.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {clientSelections.map((sel) => (
                          <div
                            key={sel.id}
                            className="bg-[var(--bg-primary)]/40 border border-[var(--border)] rounded-lg p-4 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Image thumbnail */}
                              <div className="relative aspect-[3/2] rounded-md overflow-hidden bg-black/20">
                                <MediaImage
                                  src={sel.photo.blobUrl}
                                  alt={sel.photo.title || "Selected Photo"}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 20vw"
                                  className="object-cover"
                                />
                              </div>
                              <div className="text-xs font-semibold truncate">
                                {sel.photo.title || "Untitled Photo"}
                              </div>
                            </div>

                            {/* Comment / Note */}
                            <div className="mt-3 pt-3 border-t border-[var(--border)]/60">
                              <span className="text-[10px] font-technical text-[var(--text-secondary)] tracking-wider block mb-1">
                                RETOUCHING NOTE
                              </span>
                              {sel.note && sel.note.trim() ? (
                                <div className="text-xs text-[var(--text-primary)] bg-[var(--bg-card)]/50 p-2.5 rounded border border-[var(--border)]/40 italic leading-relaxed">
                                  "{sel.note}"
                                </div>
                              ) : (
                                <div className="text-xs text-[var(--text-muted)] italic">
                                  No retouching comments left.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-[var(--text-muted)] font-technical border border-dashed border-[var(--border)] rounded-lg">
                        No photos selected by this client yet.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
              <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
              NO CLIENTS HAVE ACCESS TO THIS GALLERY YET.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
