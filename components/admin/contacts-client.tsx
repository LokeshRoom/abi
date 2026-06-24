"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2, Clock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactsClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [filter, setFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !currentRead }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting message");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !m.read;
    return m.read;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inquiries Manager</h1>
          <p className="text-[var(--text-secondary)] text-sm">Read and manage incoming contact messages.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1.5 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
          {[
            { label: "All Messages", value: "ALL" },
            { label: "Unread", value: "UNREAD" },
            { label: "Read", value: "READ" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-technical transition-all cursor-pointer ${
                filter === tab.value
                  ? "bg-[var(--accent)] text-[var(--bg-primary)] font-bold shadow-[0_0_10px_var(--accent-glow)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-[var(--bg-card)] border rounded-xl p-6 transition-all duration-[var(--transition-base)] ${
              msg.read ? "border-[var(--border)] opacity-75" : "border-[#A8D841]/30 glow-green/5"
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-lg font-bold">{msg.name}</h2>
                  {!msg.read && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-technical bg-[#A8D841]/10 text-[#A8D841] border border-[#A8D841]/20">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <a href={`mailto:${msg.email}`} className="hover:text-[var(--accent)]">
                    {msg.email}
                  </a>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="flex items-center gap-1 text-[var(--text-muted)] font-technical">
                    <Clock size={12} />
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 self-end sm:self-start shrink-0">
                <button
                  disabled={updatingId === msg.id}
                  onClick={() => handleToggleRead(msg.id, msg.read)}
                  title={msg.read ? "Mark as unread" : "Mark as read"}
                  className="p-2 bg-[var(--border)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
                >
                  {msg.read ? <Mail size={16} /> : <MailOpen size={16} />}
                </button>
                <button
                  disabled={updatingId === msg.id}
                  onClick={() => handleDelete(msg.id)}
                  title="Delete message"
                  className="p-2 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-xs font-technical text-[var(--text-muted)] mb-1">
                SUBJECT: {msg.subject || "No Subject"}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO CONTACT MESSAGES FOUND
          </div>
        )}
      </div>
    </div>
  );
}
