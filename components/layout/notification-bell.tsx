"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Check, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  // Helper for human-readable time
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-[var(--bg-card)]/50 transition-colors flex items-center justify-center cursor-pointer focus:outline-none border border-transparent hover:border-[var(--border)]"
        aria-label="Toggle notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellRing size={20} className="text-[var(--accent)] animate-pulse" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
          </>
        ) : (
          <Bell size={20} className="text-[var(--text-secondary)]" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-primary)]/40">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-technical font-bold cursor-pointer"
              >
                <Check size={12} />
                MARK ALL READ
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-[var(--border)]/50">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <Loader2 className="w-5 h-5 animate-spin mb-2 text-[var(--accent)]" />
                <span className="text-xs font-technical">LOADING NOTIFICATIONS</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <span className="text-2xl mb-2">🌟</span>
                <span className="text-sm font-semibold text-[var(--text-secondary)]">All caught up!</span>
                <span className="text-xs text-[var(--text-muted)] mt-1">No new alerts to show.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-4 py-3 flex gap-3 hover:bg-[var(--bg-primary)]/30 transition-colors cursor-pointer text-left ${
                    !n.read ? "bg-[var(--accent)]/5 border-l-2 border-[var(--accent)]" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5 gap-2">
                      <p className={`text-xs font-bold truncate ${!n.read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap font-technical">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[var(--accent)] font-technical font-bold mt-1.5 hover:underline">
                        <span>VIEW DETAILS</span>
                        <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
