import Link from "next/link";
import { NAV_ITEMS, SITE } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="film-grain relative"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container-abi" style={{ padding: "var(--section-padding) clamp(1rem, 3vw, 2rem)" }}>
        <div className="grid gap-12 md:grid-cols-3">
          {/* ═══ Brand column ═══ */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="group inline-flex flex-col gap-0 self-start">
              <span
                className="text-2xl font-extrabold leading-none tracking-tight"
                style={{ color: "var(--accent)" }}
              >
                Abi
              </span>
              <span
                className="font-technical text-[9px] leading-none tracking-[0.2em]"
                style={{ color: "var(--text-muted)" }}
              >
                PHOTO STUDIO
              </span>
            </Link>
            <p
              className="max-w-xs text-sm italic leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              &ldquo;{SITE.tagline}&rdquo;
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Professional photography by Abishek.S
            </p>
          </div>

          {/* ═══ Quick Links ═══ */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-technical text-xs font-semibold tracking-[0.15em]"
              style={{ color: "var(--text-primary)" }}
            >
              QUICK LINKS
            </h3>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ═══ Connect ═══ */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-technical text-xs font-semibold tracking-[0.15em]"
              style={{ color: "var(--text-primary)" }}
            >
              CONNECT
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
              <a
                href={`mailto:abishekmass143@gmail.com`}
                className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                style={{ color: "var(--text-secondary)" }}
              >
                abishekmass143@gmail.com
              </a>
              <a
                href={`tel:tel:+916369562031`}
                className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                style={{ color: "var(--text-secondary)" }}
              >
                +91 6369562031
              </a>
            </div>
          </div>
        </div>

        {/* ═══ Bottom bar ═══ */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            &copy; {currentYear} {SITE.name}. All rights reserved.
          </p>
          <p
            className="font-technical text-[10px] tracking-[0.15em]"
            style={{ color: "var(--text-muted)" }}
          >
            CRAFTED WITH PRECISION
          </p>
        </div>
      </div>
    </footer>
  );
}
