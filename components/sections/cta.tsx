import Link from "next/link";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="relative overflow-hidden" style={{ padding: "var(--section-padding) 0" }}>
      {/* ═══ Background gradient ═══ */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(232,99,43,0.06)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,93,170,0.04)_0%,transparent_50%)]" />

      <div className="container-abi relative z-10 flex flex-col items-center gap-8 text-center">
        <h2
          className="text-glow-orange text-3xl font-bold tracking-tight md:text-4xl"
          style={{
            fontSize: "var(--text-2xl)",
            color: "var(--text-primary)",
          }}
        >
          Book Your Session
        </h2>

        <p
          className="max-w-lg text-base leading-relaxed"
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
          }}
        >
          Ready to create something extraordinary? Let&apos;s capture moments
          that last a lifetime with precision, passion, and a cinematic eye.
        </p>

        <Link
          href="/booking"
          className={cn(
            "group relative inline-flex items-center gap-2 rounded-lg px-10 py-4",
            "text-sm font-semibold tracking-wide",
            "transition-all duration-[var(--transition-base)]",
            "hover:shadow-[0_0_40px_rgba(232,99,43,0.3)]",
            "pulse-glow"
          )}
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg-primary)",
          }}
        >
          Let&apos;s Create Together
          <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
