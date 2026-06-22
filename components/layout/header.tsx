"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminOrGalleryOrLogin =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/gallery") ||
    pathname === "/login";

  useEffect(() => {
    if (isAdminOrGalleryOrLogin) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdminOrGalleryOrLogin]);

  if (isAdminOrGalleryOrLogin) return null;


  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-40",
          "transition-all duration-[var(--transition-base)]",
          scrolled
            ? "border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="container-abi flex h-16 items-center justify-between md:h-20">
          {/* ═══ Brand wordmark ═══ */}
          <Link href="/" className="group relative z-10 flex flex-col gap-0">
            <span
              className={cn(
                "text-2xl font-extrabold leading-none tracking-tight md:text-3xl",
                "bg-gradient-to-r from-[#E8632B] via-[#FAFAFA] to-[#A8D841]",
                "bg-clip-text text-transparent",
                "transition-all duration-[var(--transition-base)]",
                "group-hover:drop-shadow-[0_0_12px_rgba(232,99,43,0.4)]"
              )}
            >
              Abi
            </span>
            <span
              className="font-technical text-[9px] leading-none tracking-[0.2em] md:text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              PHOTO STUDIO
            </span>
          </Link>

          {/* ═══ Desktop navigation ═══ */}
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* ═══ Mobile hamburger ═══ */}
          <button
            className={cn(
              "relative z-10 rounded-lg p-2 md:hidden",
              "transition-colors duration-[var(--transition-fast)]",
              "hover:bg-[var(--bg-card)]"
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu
              className="h-6 w-6"
              style={{ color: "var(--text-primary)" }}
            />
          </button>
        </div>
      </header>

      {/* ═══ Mobile overlay ═══ */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/* ═══ Individual nav link with animated underline ═══ */
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative py-1 text-sm font-medium tracking-wide",
        "transition-colors duration-[var(--transition-base)]",
        "hover:text-[var(--accent)]"
      )}
      style={{ color: "var(--text-secondary)" }}
    >
      {label}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-[2px] bg-[var(--accent)]"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
      />
    </Link>
  );
}
