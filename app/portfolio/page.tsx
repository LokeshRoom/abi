import type { Metadata } from "next";
import Image from "next/image";
import { PortfolioGrid } from "./portfolio-grid";

export const metadata: Metadata = {
  title: "Portfolio | Abi Photo Studio",
  description:
    "Explore the portfolio of Abi Photo Studio — portraits, events, street photography, cinematic captures, and nature.",
};

export default function PortfolioPage() {
  return (
    <section className="relative" style={{ paddingBottom: "var(--section-padding)" }}>
      {/* ═══ Parallax hero header ═══ */}
      <div className="relative h-[35vh] min-h-[280px] overflow-hidden">
        {/* Background photo collage (blurred) */}
        <div className="absolute inset-0">
          <Image
            src="/abishek_insta/019_DLev6B6TS03.jpg"
            alt="Portfolio showcase"
            fill
            className="object-cover blur-sm scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/60 via-[var(--bg-primary)]/40 to-[var(--bg-primary)]" />
        </div>

        {/* Title overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container-abi pb-12">
            <div className="viewfinder-corner inline-block px-4 py-2">
              <h1
                className="font-technical text-lg tracking-[0.3em]"
                style={{ color: "var(--text-primary)" }}
              >
                PORTFOLIO
              </h1>
            </div>
            <p
              className="mt-3 max-w-md text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              A curated collection of moments, stories, and visual narratives
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Gallery content ═══ */}
      <div className="container-abi pt-12">
        <PortfolioGrid />
      </div>
    </section>
  );
}
