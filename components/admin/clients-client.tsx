"use client";

import { useState } from "react";
import { Plus, X, Users, Mail, Trash2, Key, Sparkles, CheckSquare, Square, RefreshCw, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface Gallery {
  id: string;
  title: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  galleries: {
    gallery: {
      id: string;
      title: string;
    };
  }[];
  _count: {
    bookings: number;
  };
}

export default function ClientsClient({
  initialClients,
  galleries,
}: {
  initialClients: Client[];
  galleries: Gallery[];
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGalleries, setSelectedGalleries] = useState<string[]>([]);

  // Edit Gallery Access State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editSelectedGalleries, setEditSelectedGalleries] = useState<string[]>([]);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const openEditAccess = (client: Client) => {
    setEditingClient(client);
    setEditSelectedGalleries(client.galleries.map((g) => g.gallery.id));
  };

  const toggleEditGallery = (galleryId: string) => {
    setEditSelectedGalleries((prev) =>
      prev.includes(galleryId) ? prev.filter((id) => id !== galleryId) : [...prev, galleryId]
    );
  };

  const handleUpdateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setIsUpdatingAccess(true);
    try {
      const res = await fetch(`/api/admin/clients/${editingClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryIds: editSelectedGalleries,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update gallery access");
      }

      // Update local state temporarily for immediate feedback
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === editingClient.id) {
            const updatedGalleries = editSelectedGalleries.map((gid) => {
              const galleryInfo = galleries.find((g) => g.id === gid);
              return {
                gallery: {
                  id: gid,
                  title: galleryInfo?.title || "Untitled Gallery",
                },
              };
            });
            return {
              ...c,
              galleries: updatedGalleries,
            };
          }
          return c;
        })
      );

      // Close modal & refresh router
      setEditingClient(null);
      setEditSelectedGalleries([]);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error updating gallery access");
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const toggleGallery = (galleryId: string) => {
    setSelectedGalleries((prev) =>
      prev.includes(galleryId) ? prev.filter((id) => id !== galleryId) : [...prev, galleryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          galleryIds: selectedGalleries,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create client");
      }

      // Reload clients list from server via router refresh
      router.refresh();
      
      // Since it reloads, we can close form and clear
      setName("");
      setEmail("");
      setPassword("");
      setSelectedGalleries([]);
      setShowAddForm(false);
      
      // Update local state temporarily for immediate feedback
      // (Wait, we can let Next.js refresh or we can fetch list again. Fetching page refresh is standard).
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error creating client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client? They will lose access to all galleries.")) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete client");
      }

      setClients((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting client");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients Manager</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage user accounts and view client details.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? "Cancel" : "Add Client"}</span>
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8 space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <h2 className="text-lg font-bold flex items-center gap-1.5 pb-2 border-b border-[var(--border)]">
            <Sparkles size={18} className="text-[var(--accent)]" />
            Add New Client
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">FULL NAME *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">EMAIL ADDRESS *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g. rahul@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2 flex items-center gap-1">
              <Key size={12} />
              LOGIN PASSWORD *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-technical text-[var(--text-secondary)] mb-3">GRANT GALLERY ACCESS</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-4 rounded-lg bg-[var(--bg-primary)]/45 border border-[var(--border)]">
              {galleries.map((gallery) => {
                const isSelected = selectedGalleries.includes(gallery.id);
                return (
                  <button
                    type="button"
                    key={gallery.id}
                    onClick={() => toggleGallery(gallery.id)}
                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-left py-1"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[var(--accent)]" />
                    ) : (
                      <Square size={16} />
                    )}
                    <span className="truncate">{gallery.title}</span>
                  </button>
                );
              })}
              {galleries.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] col-span-full italic text-center py-2">
                  No galleries available to assign. Create galleries first.
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer"
          >
            {isSubmitting ? "Creating Client..." : "Create Client Account"}
          </button>
        </form>
      )}

      {/* Clients Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">CLIENT NAME</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">EMAIL ADDRESS</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">GALLERY ACCESS</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">BOOKINGS</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">CREATED AT</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]/20 transition-colors"
                >
                  <td className="p-4 font-semibold">{client.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    <span className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-[var(--text-muted)]" />
                      {client.email}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {client.galleries.map((g) => (
                        <span
                          key={g.gallery.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-[var(--border)] text-[var(--text-secondary)] border border-[var(--border)] whitespace-nowrap"
                        >
                          {g.gallery.title}
                        </span>
                      ))}
                      {client.galleries.length === 0 && (
                        <span className="text-xs text-[var(--text-muted)] italic">No galleries assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] font-technical text-xs">
                    {client._count.bookings} BOOKINGS
                  </td>
                  <td className="p-4 text-[var(--text-muted)] font-technical text-xs">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditAccess(client)}
                        className="p-1.5 bg-neutral-900 border border-neutral-700/50 rounded-lg text-neutral-300 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
                        title="Manage Gallery Access"
                      >
                        <FolderOpen size={14} />
                      </button>
                      <button
                        disabled={updatingId === client.id}
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
                      >
                        {updatingId === client.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[var(--text-muted)] font-technical">
                    <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                    NO ACTIVE CLIENTS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Access Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingClient(null)}
          />

          {/* Modal Card */}
          <form
            onSubmit={handleUpdateAccess}
            className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl overflow-hidden z-10 space-y-6"
          >
            <div className="absolute inset-0 scanline-effect pointer-events-none opacity-20" />

            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-xl font-bold text-white">Manage Gallery Access</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Update shared folders for {editingClient.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-technical text-[var(--text-secondary)] mb-3">SELECT ACCESSIBLE GALLERIES</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-4 rounded-lg bg-[var(--bg-primary)]/45 border border-[var(--border)]">
                {galleries.map((gallery) => {
                  const isSelected = editSelectedGalleries.includes(gallery.id);
                  return (
                    <button
                      type="button"
                      key={gallery.id}
                      onClick={() => toggleEditGallery(gallery.id)}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-left py-1"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-[var(--accent)]" />
                      ) : (
                        <Square size={16} />
                      )}
                      <span className="truncate">{gallery.title}</span>
                    </button>
                  );
                })}
                {galleries.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] col-span-full italic text-center py-2">
                    No galleries available to assign.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="w-full py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-primary)]/80 text-white font-bold border border-[var(--border)] rounded-xl transition-all cursor-pointer text-sm"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isUpdatingAccess}
                className="w-full py-2.5 bg-[var(--accent)] hover:shadow-[0_0_20px_rgba(232,99,43,0.3)] text-[var(--bg-primary)] font-bold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                {isUpdatingAccess ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <span>SAVE CHANGES</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
