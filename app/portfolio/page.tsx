import type { Metadata } from "next";
import { PortfolioGrid } from "./portfolio-grid";

export const metadata: Metadata = {
  title: "Portfolio | Abi Photo Studio",
  description:
    "Explore the portfolio of Abi Photo Studio — portraits, events, street photography, cinematic captures, and nature.",
};

export default function PortfolioPage() {
  return (
    <section className="pt-24 md:pt-28" style={{ paddingBottom: "var(--section-padding)" }}>
      <div className="container-abi">
        {/* ═══ Page title ═══ */}
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <div className="viewfinder-corner inline-block px-4 py-2">
            <h1
              className="font-technical text-lg tracking-[0.3em]"
              style={{ color: "var(--text-primary)" }}
            >
              PORTFOLIO
            </h1>
          </div>
          <p
            className="max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            A curated collection of moments, stories, and visual narratives
          </p>
        </div>

        {/* ═══ Interactive gallery ═══ */}
        <PortfolioGrid />
      </div>
    </section>
  );
}
