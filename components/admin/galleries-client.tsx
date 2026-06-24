"use client";

import { useState } from "react";
import { Plus, X, Camera, Eye, Trash, Sparkles, Key, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  password: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count: {
    photos: number;
  };
}

export default function GalleriesClient({ initialGalleries }: { initialGalleries: Gallery[] }) {
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          password: isPublic ? "" : password,
          expiresAt: isPublic ? "" : expiresAt,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create gallery");
      }

      const newGallery = await res.json();
      setGalleries((prev) => [
        { ...newGallery, _count: { photos: 0 }, createdAt: new Date().toISOString() },
        ...prev,
      ]);

      // Reset Form
      setTitle("");
      setDescription("");
      setIsPublic(false);
      setPassword("");
      setExpiresAt("");
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error creating gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery? This action cannot be undone.")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/galleries/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete gallery");
      }

      setGalleries((prev) => prev.filter((g) => g.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting gallery");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Galleries Manager</h1>
          <p className="text-[var(--text-secondary)] text-sm">Create, publish, and delete client proofing galleries.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? "Cancel" : "New Gallery"}</span>
        </button>
      </div>

      {/* New Gallery Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8 space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <h2 className="text-lg font-bold flex items-center gap-1.5 pb-2 border-b border-[var(--border)]">
            <Sparkles size={18} className="text-[var(--accent)]" />
            Create New Gallery
          </h2>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">GALLERY TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="e.g. Aditi & Rahul Wedding"
            />
          </div>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              placeholder="Provide context or instructions for clients..."
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] bg-[var(--bg-primary)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="isPublic" className="text-sm text-[var(--text-secondary)] select-none">
              Make this gallery public (accessible without login/passwords)
            </label>
          </div>

          {/* Conditional private details */}
          {!isPublic && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border)] animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                  <Key size={12} />
                  GALLERY PASSWORD (OPTIONAL)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="Password-protect gallery"
                />
              </div>
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                  <Calendar size={12} />
                  EXPIRATION DATE (OPTIONAL)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Gallery"}
          </button>
        </form>
      )}

      {/* Galleries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-technical ${
                    gallery.isPublic
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {gallery.isPublic ? "PUBLIC" : "PRIVATE"}
                </span>
                <span className="text-[var(--text-muted)] text-xs font-technical">
                  {gallery._count.photos} PHOTOS
                </span>
              </div>
              <h2 className="text-lg font-bold mb-2 line-clamp-1">{gallery.title}</h2>
              {gallery.description ? (
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{gallery.description}</p>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic mb-4">No description provided</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex gap-4">
                <Link
                  href={`/admin/galleries/${gallery.id}`}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors font-semibold"
                >
                  <Camera size={14} />
                  <span>Manage Photos</span>
                </Link>
                <Link
                  href={`/gallery/${gallery.slug}?preview=true`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  <Eye size={14} />
                  <span>View</span>
                </Link>
              </div>
              <button
                disabled={updatingId === gallery.id}
                onClick={() => handleDelete(gallery.id)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {galleries.length === 0 && (
          <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
            <Camera className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO GALLERIES CREATED YET
          </div>
        )}
      </div>
    </div>
  );
}
