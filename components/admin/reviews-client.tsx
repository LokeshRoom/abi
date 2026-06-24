"use client";

import { useState } from "react";
import { Star, Trash2, Plus, X, Heart, ShieldAlert, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar: string | null;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export default function ReviewsClient({ initialReviews }: { initialReviews: Testimonial[] }) {
  const [reviews, setReviews] = useState<Testimonial[]>(initialReviews);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newFeatured, setNewFeatured] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContent) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          content: newContent,
          rating: newRating,
          featured: newFeatured,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add review");
      }

      const addedReview = await res.json();
      setReviews((prev) => [addedReview, ...prev]);

      // Reset form
      setNewName("");
      setNewRole("");
      setNewContent("");
      setNewRating(5);
      setNewFeatured(true);
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error adding review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, featured: !currentFeatured } : r))
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating featured status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting review");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reviews & Testimonials</h1>
          <p className="text-[var(--text-secondary)] text-sm">Add, remove, or feature client reviews on your website.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? "Cancel" : "Add Review"}</span>
        </button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8 space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <h2 className="text-lg font-bold flex items-center gap-1.5 pb-2 border-b border-[var(--border)]">
            <Sparkles size={18} className="text-[var(--accent)]" />
            Add New Review
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">CLIENT NAME *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g. Priyan & Deepa"
              />
            </div>
            <div>
              <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">CLIENT ROLE / CATEGORY</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g. Wedding Client"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">RATING (1-5 STARS)</label>
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setNewRating(val)}
                  className={`text-xl transition-all cursor-pointer ${
                    val <= newRating ? "text-yellow-400 scale-110" : "text-[var(--text-muted)]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">REVIEW CONTENT *</label>
            <textarea
              required
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              placeholder="Write the client testimonial here..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={newFeatured}
              onChange={(e) => setNewFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] bg-[var(--bg-primary)] focus:ring-[var(--accent)]"
            />
            <label htmlFor="featured" className="text-sm text-[var(--text-secondary)] select-none">
              Feature on homepage testimonials slider
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
          >
            {isSubmitting ? "Adding..." : "Save Review"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-0.5 text-sm text-yellow-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={updatingId === rev.id}
                    onClick={() => handleToggleFeatured(rev.id, rev.featured)}
                    title={rev.featured ? "Un-feature from homepage" : "Feature on homepage"}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      rev.featured
                        ? "bg-[#E8632B]/10 border-[#E8632B]/30 text-[#E8632B] hover:bg-[#E8632B]/20"
                        : "bg-[var(--border)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <Heart size={14} fill={rev.featured ? "currentColor" : "none"} />
                  </button>
                  <button
                    disabled={updatingId === rev.id}
                    onClick={() => handleDelete(rev.id)}
                    title="Delete review"
                    className="p-1.5 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-6">
                &ldquo;{rev.content}&rdquo;
              </p>
            </div>

            <div className="flex justify-between items-end border-t border-[var(--border)] pt-4 mt-auto">
              <div>
                <p className="text-sm font-semibold">{rev.name}</p>
                <p className="text-[10px] font-technical text-[var(--text-muted)]">
                  {rev.role || "Client"}
                </p>
              </div>
              <span className="text-[9px] font-technical text-[var(--text-muted)]">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO CLIENT REVIEWS FOUND
          </div>
        )}
      </div>
    </div>
  );
}
