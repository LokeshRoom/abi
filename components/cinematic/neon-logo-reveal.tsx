'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════
   NEON LOGO REVEAL — Hero brand reveal animation
   ═══════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────
interface NeonLogoRevealProps {
  /** Tagline quote shown below PHOTO STUDIO. */
  tagline?: string;
  /** Callback when the full reveal sequence is complete. */
  onComplete?: () => void;
  /** Custom class for the outer wrapper. */
  className?: string;
}

// ── Component ──────────────────────────────────────────
export function NeonLogoReveal({
  tagline = 'Every frame tells a story',
  onComplete,
  className = '',
}: NeonLogoRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoSvgRef = useRef<SVGSVGElement>(null);
  const logoTextRef = useRef<SVGTextElement>(null);
  const studioRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setPrefersReduced(reduced);

    if (reduced) {
      // Show everything immediately
      if (logoTextRef.current) {
        logoTextRef.current.style.opacity = '1';
        logoTextRef.current.style.fill = '#E8632B';
        logoTextRef.current.style.filter =
          'brightness(1.2) drop-shadow(0 0 20px rgba(232, 99, 43, 0.6))';
      }
      if (studioRef.current) {
        studioRef.current.style.opacity = '1';
        studioRef.current.style.width = 'auto';
      }
      if (taglineRef.current) {
        taglineRef.current.style.opacity = '1';
      }
      onComplete?.();
      return;
    }

    // ── Build GSAP timeline ──
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => onComplete?.(),
      });
      tlRef.current = tl;

      const logo = logoTextRef.current;
      const studio = studioRef.current;
      const tag = taglineRef.current;

      if (!logo || !studio || !tag) return;

      // ── Phase 1 (0–0.3s): Faint dark outline ──
      tl.set(logo, {
        opacity: 0.15,
        fill: 'none',
        stroke: 'rgba(168, 216, 65, 0.2)',
        strokeWidth: 0.5,
        filter: 'brightness(0.3)',
      });
      tl.to(logo, {
        opacity: 0.3,
        stroke: 'rgba(168, 216, 65, 0.35)',
        duration: 0.3,
        ease: 'power1.inOut',
      });

      // ── Phase 2 (0.3s–0.8s): Neon green flicker ──
      const flickerDurations = [0.06, 0.1, 0.08];
      const gapDurations = [0.08, 0.12, 0.06];

      for (let i = 0; i < 3; i++) {
        // Flash ON
        tl.to(logo, {
          opacity: 1,
          stroke: '#A8D841',
          strokeWidth: 1,
          filter:
            'brightness(2) drop-shadow(0 0 12px rgba(168, 216, 65, 0.8))',
          duration: flickerDurations[i],
          ease: 'power4.in',
        });
        // Flash OFF
        tl.to(logo, {
          opacity: 0.2,
          stroke: 'rgba(168, 216, 65, 0.15)',
          strokeWidth: 0.5,
          filter: 'brightness(0.3)',
          duration: gapDurations[i],
          ease: 'power4.out',
        });
      }

      // ── Phase 3 (0.8s–1.2s): Full color fills in with bloom ──
      tl.to(logo, {
        opacity: 1,
        fill: '#E8632B',
        stroke: 'rgba(232, 99, 43, 0.4)',
        strokeWidth: 0.3,
        filter:
          'brightness(1.4) drop-shadow(0 0 30px rgba(232, 99, 43, 0.7)) drop-shadow(0 0 60px rgba(232, 99, 43, 0.3))',
        duration: 0.4,
        ease: 'power2.out',
      });

      // Settle bloom to subtle ambient level
      tl.to(logo, {
        filter:
          'brightness(1.1) drop-shadow(0 0 15px rgba(232, 99, 43, 0.5)) drop-shadow(0 0 40px rgba(232, 99, 43, 0.15))',
        duration: 0.3,
        ease: 'power1.inOut',
      });

      // ── PHOTO STUDIO typewriter ──
      tl.fromTo(
        studio,
        { width: 0, opacity: 1 },
        {
          width: 'auto',
          duration: 0.5,
          ease: 'steps(12)',
        },
        '-=0.2',
      );

      // ── Tagline fade-in ──
      tl.fromTo(
        tag,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.1',
      );
    }, containerRef);

    return () => {
      ctx.revert();
      tlRef.current?.kill();
    };
  }, [onComplete, prefersReduced]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        userSelect: 'none',
      }}
    >
      {/* ── Logo SVG text ── */}
      <svg
        ref={logoSvgRef}
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: 'clamp(160px, 30vw, 360px)',
          height: 'auto',
          overflow: 'visible',
        }}
        aria-label="Abi"
        role="img"
      >
        <text
          ref={logoTextRef}
          x="100"
          y="55"
          textAnchor="middle"
          fontFamily="'Outfit', sans-serif"
          fontWeight="800"
          fontSize="72"
          fill="none"
          stroke="transparent"
          style={{
            opacity: 0,
            letterSpacing: '0.02em',
          }}
        >
          Abi
        </text>
      </svg>

      {/* ── PHOTO STUDIO typewriter line ── */}
      <span
        ref={studioRef}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'var(--text-sm, 0.875rem)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary, #888)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          width: 0,
          opacity: 0,
          borderRight: '2px solid var(--text-secondary, #888)',
        }}
        className={prefersReduced ? '' : 'neon-logo-caret-blink'}
      >
        Photo Studio
      </span>

      {/* ── Tagline ── */}
      <p
        ref={taglineRef}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'var(--text-base, 1rem)',
          color: 'var(--text-muted, #555)',
          fontStyle: 'italic',
          opacity: 0,
          marginTop: '0.75rem',
        }}
      >
        {tagline}
      </p>

      {/* ── Phase 4 ambient glow pulse (CSS only) ── */}
      <style>{`
        @keyframes _neon-ambient-glow {
          0%, 100% {
            filter: brightness(1.1)
              drop-shadow(0 0 15px rgba(232, 99, 43, 0.45))
              drop-shadow(0 0 40px rgba(232, 99, 43, 0.12));
          }
          50% {
            filter: brightness(1.2)
              drop-shadow(0 0 22px rgba(232, 99, 43, 0.6))
              drop-shadow(0 0 50px rgba(232, 99, 43, 0.2));
          }
        }

        @keyframes _neon-caret-blink {
          0%, 100% { border-color: transparent; }
          50% { border-color: var(--text-secondary, #888); }
        }

        .neon-logo-caret-blink {
          animation: _neon-caret-blink 0.8s step-end infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .neon-logo-caret-blink {
            animation: none;
            border-color: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}

export default NeonLogoReveal;
