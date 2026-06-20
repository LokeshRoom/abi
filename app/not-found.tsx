import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="scanline-effect relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ═══ Rule-of-thirds grid lines ═══ */}
      <div className="pointer-events-none absolute inset-0">
        {/* Vertical lines */}
        <div
          className="absolute top-0 bottom-0 left-1/3 w-px"
          style={{ backgroundColor: "var(--border)" }}
        />
        <div
          className="absolute top-0 bottom-0 left-2/3 w-px"
          style={{ backgroundColor: "var(--border)" }}
        />
        {/* Horizontal lines */}
        <div
          className="absolute right-0 left-0 top-1/3 h-px"
          style={{ backgroundColor: "var(--border)" }}
        />
        <div
          className="absolute right-0 left-0 top-2/3 h-px"
          style={{ backgroundColor: "var(--border)" }}
        />
      </div>

      <div className="container-abi relative z-10 flex flex-col items-center gap-6 text-center">
        {/* ═══ 404 number ═══ */}
        <h1
          className={cn(
            "neon-flicker text-glow-orange",
            "font-technical text-8xl font-bold tracking-wider md:text-9xl"
          )}
          style={{ color: "var(--accent)" }}
        >
          404
        </h1>

        {/* ═══ Message ═══ */}
        <p
          className="font-technical text-sm tracking-[0.2em]"
          style={{ color: "var(--text-secondary)" }}
        >
          FRAME NOT FOUND
        </p>

        <p
          className="max-w-sm text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          The frame you&apos;re looking for doesn&apos;t exist in this roll.
          It may have been moved or never developed.
        </p>

        {/* ═══ Return link ═══ */}
        <Link
          href="/"
          className={cn(
            "group mt-4 inline-flex items-center gap-2 rounded-lg border px-6 py-3",
            "font-technical text-xs tracking-[0.15em]",
            "transition-all duration-[var(--transition-base)]",
            "hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)]"
          )}
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:-translate-x-1">
            ←
          </span>
          RETURN TO VIEWFINDER
        </Link>
      </div>
    </section>
  );
}
