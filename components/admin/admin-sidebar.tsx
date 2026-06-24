"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  LayoutDashboard,
  Users,
  LogOut,
  Settings,
  Calendar,
  MessageSquare,
  Star,
  Newspaper,
  Menu,
  X
} from "lucide-react";
import NotificationBell from "@/components/layout/notification-bell";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  email: string;
}

export default function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { section: "CORE", items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }
    ]},
    { section: "CONTENT MANAGEMENT", items: [
      { label: "Bookings", href: "/admin/bookings", icon: Calendar },
      { label: "Contacts", href: "/admin/contacts", icon: MessageSquare },
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Blogs", href: "/admin/blogs", icon: Newspaper }
    ]},
    { section: "SYSTEM", items: [
      { label: "Galleries", href: "/admin/galleries", icon: Camera },
      { label: "Clients", href: "/admin/clients", icon: Users },
      { label: "Settings", href: "/admin/settings", icon: Settings }
    ]}
  ];

  const firstLetter = email ? email[0].toUpperCase() : "A";

  const renderNavContent = () => (
    <>
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="px-4 py-1.5 text-[9px] font-technical tracking-widest text-[var(--text-muted)]">
              {group.section}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-[var(--transition-fast)] border-l-2",
                    isActive
                      ? "bg-[var(--bg-card)] border-[var(--accent)] text-[var(--accent)] font-semibold"
                      : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/50 hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon size={16} className={isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-primary)]/50">
        <div className="flex items-center gap-2.5 text-[var(--text-secondary)] min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center font-technical text-xs border border-[var(--text-muted)] text-[var(--text-primary)] shrink-0 select-none">
            {firstLetter}
          </div>
          <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {email}
          </div>
        </div>
        <form action="/api/auth/signout" method="POST" className="w-full">
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-2 mt-2.5 w-full text-left rounded-lg hover:bg-red-950/30 hover:text-red-500 transition-colors text-xs cursor-pointer font-medium"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden md:flex w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--accent)]">Abi</span>
            <span className="font-technical text-xs text-[var(--text-muted)] tracking-widest mt-1">ADMIN</span>
          </Link>
          <NotificationBell align="left" />
        </div>
        {renderNavContent()}
      </aside>

      {/* ═══ Mobile Top Bar ═══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-6 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--accent)]">Abi</span>
          <span className="font-technical text-[10px] text-[var(--text-muted)] tracking-widest mt-0.5">ADMIN</span>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell align="right" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-secondary)] transition-all cursor-pointer bg-[var(--bg-card)]/50"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ═══ Mobile Navigation Drawer Overlay ═══ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Side Drawer Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col h-screen z-50 shadow-2xl"
            >
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-primary)]/20">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[var(--accent)]">Abi</span>
                  <span className="font-technical text-[10px] text-[var(--text-muted)] tracking-widest mt-0.5">ADMIN</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              {renderNavContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
