import type { Metadata } from "next";
import Image from "next/image";
import { Camera, ImageIcon, Video, Users } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About | Abi Photo Studio",
  description:
    "Learn about Abishek.S and his passion for cinematic photography — the story, philosophy, and craft behind Abi Photo Studio.",
};

const SERVICES = [
  {
    icon: Camera,
    title: "Portrait Photography",
    description:
      "Intimate, expressive portraits that reveal character and emotion through masterful lighting.",
  },
  {
    icon: ImageIcon,
    title: "Event Coverage",
    description:
      "Comprehensive event documentation capturing every pivotal moment with cinematic flair.",
  },
  {
    icon: Video,
    title: "Cinematic Sessions",
    description:
      "Film-inspired photo sessions with dramatic lighting, color grading, and narrative composition.",
  },
  {
    icon: Users,
    title: "Brand & Commercial",
    description:
      "Elevated visual content for brands seeking authentic, story-driven imagery.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ═══ Hero image ═══ */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src="/about-cover.png" // 👈 Remove the query parameters
          alt="Photographer at work"
          fill
          sizes="100vw" // Best practice when using 'fill'
          className="object-cover" // If you want the 'fit=crop' behavior
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-transparent to-[var(--bg-primary)]" />

        {/* ═══ Title overlay ═══ */}
        <div className="absolute inset-0 flex items-end">
          <div className="container-abi pb-12">
            <h1
              className="text-glow-orange text-4xl font-bold tracking-tight md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              About
            </h1>
            <div
              className="font-technical mt-2 text-xs tracking-[0.2em]"
              style={{ color: "var(--accent)" }}
            >
              THE STORY BEHIND THE LENS
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Bio section ═══ */}
      <section style={{ padding: "var(--section-padding) 0" }}>
        <div className="container-abi">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ═══ Photo ═══ */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl lg:aspect-auto">
              <Image
                src="/abi.jpg"
                alt="Abishek.S — Photographer"
                width={800}
                height={1000}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/30 to-transparent" />
            </div>

            {/* ═══ Bio text ═══ */}
            <div className="flex flex-col justify-center gap-6">
              <h2
                className="text-2xl font-bold tracking-tight md:text-3xl"
                style={{
                  fontSize: "var(--text-2xl)",
                  color: "var(--text-primary)",
                }}
              >
                Abishek.S
              </h2>
              <div className="flex flex-col gap-4">
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  I&apos;m a photographer driven by the pursuit of the perfect
                  frame. Every shoot is an opportunity to tell a story — not
                  just capture an image. My work blends technical precision with
                  raw emotion, creating photographs that resonate long after the
                  moment has passed.
                </p>
                <p
                  className="leading-relaxed"
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  From the bustling streets of the city to quiet, intimate
                  portrait sessions, I bring a cinematic eye to every project.
                  My approach is rooted in understanding light, composition,
                  and the authentic essence of every subject.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Philosophy ═══ */}
      <section
        className="relative overflow-hidden"
        style={{
          padding: "var(--section-padding) 0",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,99,43,0.05)_0%,transparent_60%)]" />
        <div className="container-abi relative z-10 text-center">
          <div
            className="font-technical mb-6 text-xs tracking-[0.2em]"
            style={{ color: "var(--accent)" }}
          >
            PHILOSOPHY
          </div>
          <blockquote
            className="mx-auto max-w-2xl text-2xl font-light italic leading-relaxed md:text-3xl"
            style={{
              fontSize: "var(--text-xl)",
              color: "var(--text-primary)",
            }}
          >
            &ldquo;{SITE.tagline}&rdquo;
          </blockquote>
          <p
            className="mt-6 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            — Abishek.S
          </p>
        </div>
      </section>

      {/* ═══ Services ═══ */}
      <section style={{ padding: "var(--section-padding) 0" }}>
        <div className="container-abi">
          <div className="mb-12 text-center">
            <h2
              className="font-technical text-sm tracking-[0.2em]"
              style={{ color: "var(--text-primary)" }}
            >
              SERVICES
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className={cn(
                    "group flex flex-col gap-4 rounded-xl border p-6",
                    "transition-all duration-[var(--transition-base)]",
                    "hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
                  )}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-[var(--transition-base)] group-hover:bg-[var(--accent-glow)]"
                    style={{ color: "var(--accent)" }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
