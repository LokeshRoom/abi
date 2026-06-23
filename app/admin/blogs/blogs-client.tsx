"use client";

import { useState, useRef, useEffect } from "react";
import {
  Newspaper,
  Trash2,
  Plus,
  X,
  Edit2,
  Sparkles,
  Globe,
  Lock,
  Upload,
  RefreshCw,
  AlertCircle,
  Calendar,
  Eye,
} from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export function BlogsClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isSlugManual && !editingPost) {
      setSlug(slugify(title));
    }
  }, [title, isSlugManual, editingPost]);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle("");
    setSlug("");
    setIsSlugManual(false);
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setPublished(false);
    setShowForm(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setIsSlugManual(true);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setCoverImage(post.coverImage || "");
    setPublished(post.published);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isPublic", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload file");
      }

      const data = await res.json();
      setCoverImage(data.photo.blobUrl);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Error uploading cover photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    const postData = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      published,
    };

    try {
      if (editingPost) {
        // Update Post
        const res = await fetch(`/api/admin/blogs/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!res.ok) throw new Error("Failed to update blog post");

        const updated = await res.json();
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        // Create Post
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });

        if (!res.ok) throw new Error("Failed to create blog post");

        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
      }

      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(editingPost ? "Error updating post" : "Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished }),
      });

      if (!res.ok) throw new Error("Failed to update publish status");

      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating publish status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete blog post");

      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting blog post");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Publish behind-the-scenes stories, photo tips, and news.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      {/* Write/Edit Blog Form Modal/Section */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-[var(--accent)]" />
                {editingPost ? "Edit Blog Post" : "Write New Blog Post"}
              </h2>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form Column */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                    POST TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="e.g. Navigating Golden Hour Light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                    URL SLUG (AUTO-GENERATED) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsSlugManual(true);
                    }}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="e.g. navigating-golden-hour-light"
                  />
                </div>

                <div>
                  <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                    SHORT EXCERPT / DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                    placeholder="A brief summary of the article..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                    ARTICLE BODY (MARKDOWN/PLAIN TEXT) *
                  </label>
                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[var(--accent)] transition-colors resize-y leading-relaxed"
                    placeholder="Write the full content of the post..."
                  />
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                    COVER IMAGE
                  </label>
                  <div className="border border-dashed border-[var(--border)] rounded-lg p-4 text-center bg-[var(--bg-primary)] relative group">
                    {coverImage ? (
                      <div className="relative aspect-[16/10] w-full rounded overflow-hidden mb-3">
                        <MediaImage
                          src={coverImage}
                          alt="Cover preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverImage("")}
                          className="absolute top-1 right-1 bg-red-600/90 text-white rounded p-1 hover:bg-red-500 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center">
                        <Upload
                          size={24}
                          className="text-[var(--text-muted)] mb-2 group-hover:text-[var(--accent)] transition-colors"
                        />
                        <p className="text-xs text-[var(--text-secondary)] mb-1">
                          PNG or JPG up to 10MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs hover:border-[var(--border-hover)] transition-colors cursor-pointer"
                    >
                      {uploading ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      <span>{uploading ? "Uploading..." : "Upload Cover Image"}</span>
                    </button>
                  </div>
                  {uploadError && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> {uploadError}
                    </p>
                  )}
                </div>

                <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4 space-y-4">
                  <h3 className="text-xs font-technical text-[var(--text-secondary)] uppercase tracking-wider pb-1 border-b border-[var(--border)]">
                    Publishing Settings
                  </h3>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="published"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] bg-[var(--bg-primary)] focus:ring-[var(--accent)] cursor-pointer"
                    />
                    <label
                      htmlFor="published"
                      className="text-sm font-medium text-[var(--text-secondary)] select-none cursor-pointer"
                    >
                      Publish immediately
                    </label>
                  </div>

                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                    Unpublished posts are saved as drafts and will not be displayed on the public
                    website.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card)] transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <span>{editingPost ? "Save Changes" : "Publish Post"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)]"
          >
            {post.coverImage ? (
              <div className="w-full md:w-44 aspect-[16/10] relative rounded-lg overflow-hidden shrink-0 bg-[var(--bg-primary)]">
                <MediaImage
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full md:w-44 aspect-[16/10] relative rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                <Newspaper size={28} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  onClick={() => handleTogglePublish(post.id, post.published)}
                  title="Click to toggle status"
                  className={`px-2 py-0.5 rounded text-[9px] font-technical flex items-center gap-1 border cursor-pointer select-none transition-all ${
                    post.published
                      ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                  }`}
                >
                  {post.published ? (
                    <>
                      <Globe size={10} /> PUBLISHED
                    </>
                  ) : (
                    <>
                      <Lock size={10} /> DRAFT
                    </>
                  )}
                </span>
                <span className="text-[10px] font-technical text-[var(--text-muted)] flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-1 hover:text-[var(--accent)] transition-colors line-clamp-1">
                {post.title}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4 leading-relaxed">
                {post.excerpt || "No description provided."}
              </p>

              <div className="flex justify-between items-center border-t border-[var(--border)]/50 pt-3">
                <span className="text-[10px] font-technical text-[var(--text-muted)] uppercase tracking-wider">
                  slug: <span className="text-[var(--text-secondary)]">{post.slug}</span>
                </span>
                <div className="flex gap-2">
                  {post.published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
                      title="View Live Post"
                    >
                      <Eye size={14} />
                    </a>
                  )}
                  <button
                    disabled={updatingId === post.id}
                    onClick={() => handleOpenEdit(post)}
                    className="p-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    disabled={updatingId === post.id}
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
                    title="Delete Post"
                  >
                    {updatingId === post.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-16 text-center text-[var(--text-muted)] font-technical">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO BLOG POSTS FOUND
          </div>
        )}
      </div>
    </div>
  );
}
