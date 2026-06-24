"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, SunMoon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useTheme } from "@/components/layout/theme-provider";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleLight } = useTheme();

  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

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
          "transition-all duration-500",
          scrolled
            ? "glass border-b border-white/[0.04]"
            : "bg-transparent"
        )}
      >
        <div className="container-abi flex h-16 items-center justify-between md:h-20">
          {/* ═══ Brand wordmark ═══ */}
          <Link href="/" className="group relative z-10 flex flex-col gap-0">
            <motion.span
              className={cn(
                "text-2xl font-extrabold leading-none tracking-tight md:text-3xl",
                "bg-gradient-to-r from-[#E8632B] via-[#FAFAFA] to-[#A8D841]",
                "bg-clip-text text-transparent"
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              Abi
            </motion.span>
            <span
              className="font-technical text-[9px] leading-none tracking-[0.2em] md:text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              PHOTO STUDIO
            </span>
          </Link>

          {/* ═══ Desktop navigation ═══ */}
          <div className="hidden items-center gap-8 md:flex">
            <nav
              className="flex items-center gap-8"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>

            <motion.button
              onClick={toggleLight}
              className={cn(
                "p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-secondary)] transition-all cursor-pointer flex items-center justify-center",
                "hover:shadow-[0_0_15px_var(--accent-glow)] hover:bg-[var(--bg-card)]"
              )}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              <SunMoon size={16} />
            </motion.button>
          </div>

          {/* ═══ Mobile hamburger ═══ */}
          <motion.button
            className={cn(
              "relative z-10 rounded-lg p-2 md:hidden",
              "transition-colors duration-[var(--transition-fast)]",
              "hover:bg-[var(--bg-card)]"
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            whileTap={{ scale: 0.9 }}
          >
            <Menu
              className="h-6 w-6"
              style={{ color: "var(--text-primary)" }}
            />
          </motion.button>
        </div>

        {/* ═══ Scroll progress bar ═══ */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width: progressWidth,
            background: "linear-gradient(90deg, #E8632B, #A8D841)",
          }}
        />
      </header>

      {/* ═══ Mobile overlay ═══ */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/* ═══ Individual nav link with animated underline ═══ */
function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative py-1 text-sm font-medium tracking-wide",
        "transition-colors duration-[var(--transition-base)]",
        "hover:text-[var(--accent)]"
      )}
      style={{
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
      }}
    >
      {label}
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      {/* Hover underline */}
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
