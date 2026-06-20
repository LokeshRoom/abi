'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════
   APERTURE TRANSITION — Camera-shutter page transition
   ═══════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────
interface ApertureContextValue {
  /** Fire the shutter close → hold → open sequence.
   *  Resolves once the full animation completes. */
  triggerTransition: (onMidpoint?: () => void | Promise<void>) => Promise<void>;
  /** `true` when the aperture is fully open (idle). */
  isOpen: boolean;
}

// ── Context ────────────────────────────────────────────
const ApertureContext = createContext<ApertureContextValue | null>(null);

export function useAperture(): ApertureContextValue {
  const ctx = useContext(ApertureContext);
  if (!ctx) {
    throw new Error('useAperture must be used inside <ApertureProvider>');
  }
  return ctx;
}

// ── Geometry helpers ───────────────────────────────────
const BLADE_COUNT = 8;
const VIEWBOX = 1000;
const CENTER = VIEWBOX / 2;
/** Outer radius — blades start just outside the viewport diagonal. */
const R_OUTER = VIEWBOX * 0.85;
/** When fully "closed" the inner tip reaches dead-center. */
const R_INNER_CLOSED = 0;
/** When fully "open" the inner tip is past the viewport edge. */
const R_INNER_OPEN = VIEWBOX * 0.9;

/** Half-angle of each blade (in radians). */
const HALF_ANGLE = Math.PI / BLADE_COUNT;

/** Build a polygon string for a single blade whose inner tip is at `rInner`. */
function bladePoints(index: number, rInner: number): string {
  const angle = (2 * Math.PI * index) / BLADE_COUNT - Math.PI / 2; // start at top

  const cos = Math.cos;
  const sin = Math.sin;

  // Inner tip
  const ix = CENTER + rInner * cos(angle);
  const iy = CENTER + rInner * sin(angle);

  // Two outer corners
  const lx = CENTER + R_OUTER * cos(angle - HALF_ANGLE);
  const ly = CENTER + R_OUTER * sin(angle - HALF_ANGLE);
  const rx = CENTER + R_OUTER * cos(angle + HALF_ANGLE);
  const ry = CENTER + R_OUTER * sin(angle + HALF_ANGLE);

  return `${ix},${iy} ${lx},${ly} ${rx},${ry}`;
}

// ── Component ──────────────────────────────────────────
function ApertureTransition() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bladeRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const brandRef = useRef<SVGTextElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const prefersReduced = useRef(false);

  // Detect reduced-motion preference once on mount
  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  // Initialise blade positions to "open" (inner tip = R_INNER_OPEN)
  useEffect(() => {
    bladeRefs.current.forEach((blade, i) => {
      if (blade) blade.setAttribute('points', bladePoints(i, R_INNER_OPEN));
    });
  }, []);

  const triggerTransition = useCallback(
    async (onMidpoint?: () => void | Promise<void>): Promise<void> => {
      // Kill any running timeline
      tlRef.current?.kill();

      // ── Reduced motion: instant cut ──
      if (prefersReduced.current) {
        setIsOpen(false);
        bladeRefs.current.forEach((b, i) => {
          if (b) b.setAttribute('points', bladePoints(i, R_INNER_CLOSED));
        });
        if (brandRef.current) brandRef.current.style.opacity = '1';
        if (onMidpoint) await onMidpoint();
        bladeRefs.current.forEach((b, i) => {
          if (b) b.setAttribute('points', bladePoints(i, R_INNER_OPEN));
        });
        if (brandRef.current) brandRef.current.style.opacity = '0';
        setIsOpen(true);
        return;
      }

      // ── Full animated sequence ──
      return new Promise<void>((resolve) => {
        setIsOpen(false);

        const tl = gsap.timeline({
          onComplete: () => {
            setIsOpen(true);
            resolve();
          },
        });

        tlRef.current = tl;

        // Phase 1 — close blades inward
        bladeRefs.current.forEach((blade, i) => {
          if (!blade) return;
          const proxy = { r: R_INNER_OPEN };
          tl.to(
            proxy,
            {
              r: R_INNER_CLOSED,
              duration: 0.4,
              ease: 'power3.in',
              onUpdate: () => {
                blade.setAttribute('points', bladePoints(i, proxy.r));
              },
            },
            i * 0.02, // stagger
          );
        });

        // Phase 2 — hold: show brand mark
        tl.to(brandRef.current, {
          opacity: 1,
          duration: 0.05,
          ease: 'none',
        });

        tl.addPause('+=0.1', async () => {
          // Execute midpoint callback (e.g. route change)
          if (onMidpoint) await onMidpoint();
          tl.resume();
        });

        // Phase 3 — open blades outward
        tl.to(brandRef.current, {
          opacity: 0,
          duration: 0.08,
          ease: 'none',
        });

        bladeRefs.current.forEach((blade, i) => {
          if (!blade) return;
          const proxy = { r: R_INNER_CLOSED };
          tl.to(
            proxy,
            {
              r: R_INNER_OPEN,
              duration: 0.5,
              ease: 'power2.out',
              onUpdate: () => {
                blade.setAttribute('points', bladePoints(i, proxy.r));
              },
            },
            `>-${0.5 - i * 0.02}`, // stagger from current position
          );
        });
      });
    },
    [],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: isOpen ? 'none' : 'auto',
        opacity: isOpen ? 0 : 1,
        transition: 'opacity 0.05s',
      }}
    >
      {/* Background fill behind blades — visible during hold */}
      <rect width={VIEWBOX} height={VIEWBOX} fill="#0A0A0A" />

      {/* Shutter blades */}
      {Array.from({ length: BLADE_COUNT }).map((_, i) => (
        <polygon
          key={i}
          ref={(el) => {
            bladeRefs.current[i] = el;
          }}
          points={bladePoints(i, R_INNER_OPEN)}
          fill="#141414"
          stroke="#1E1E1E"
          strokeWidth="1.5"
        />
      ))}

      {/* Centered brand mark during hold */}
      <text
        ref={brandRef}
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#E8632B"
        fontFamily="'Outfit', sans-serif"
        fontWeight="700"
        fontSize="80"
        style={{ opacity: 0, letterSpacing: '0.02em' }}
      >
        Abi
      </text>
    </svg>
  );
}

// ── Provider ───────────────────────────────────────────
export function ApertureProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const transitionRef = useRef<{
    triggerTransition: ApertureContextValue['triggerTransition'];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerTransition: ApertureContextValue['triggerTransition'] =
    useCallback(
      async (onMidpoint) => {
        setIsOpen(false);
        try {
          if (transitionRef.current) {
            await transitionRef.current.triggerTransition(onMidpoint);
          }
        } finally {
          setIsOpen(true);
        }
      },
      [],
    );

  // Use an inner wrapper to bridge the ref
  return (
    <ApertureContext.Provider value={{ triggerTransition, isOpen }}>
      {children}
      {mounted && <ApertureTransitionBridge ref={transitionRef} />}
    </ApertureContext.Provider>
  );
}

/** Internal bridge that lets the provider access the transition impl. */
import { forwardRef, useImperativeHandle } from 'react';

const ApertureTransitionBridge = forwardRef<{
  triggerTransition: ApertureContextValue['triggerTransition'];
}>(function ApertureTransitionBridge(_props, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bladeRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const brandRef = useRef<SVGTextElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  useEffect(() => {
    bladeRefs.current.forEach((blade, i) => {
      if (blade) blade.setAttribute('points', bladePoints(i, R_INNER_OPEN));
    });
  }, []);

  const triggerTransition = useCallback(
    async (onMidpoint?: () => void | Promise<void>): Promise<void> => {
      tlRef.current?.kill();

      if (prefersReduced.current) {
        setIsOpen(false);
        bladeRefs.current.forEach((b, i) => {
          if (b) b.setAttribute('points', bladePoints(i, R_INNER_CLOSED));
        });
        if (brandRef.current) brandRef.current.style.opacity = '1';
        if (onMidpoint) await onMidpoint();
        bladeRefs.current.forEach((b, i) => {
          if (b) b.setAttribute('points', bladePoints(i, R_INNER_OPEN));
        });
        if (brandRef.current) brandRef.current.style.opacity = '0';
        setIsOpen(true);
        return;
      }

      return new Promise<void>((resolve) => {
        setIsOpen(false);

        const tl = gsap.timeline({
          onComplete: () => {
            setIsOpen(true);
            resolve();
          },
        });

        tlRef.current = tl;

        // Close
        bladeRefs.current.forEach((blade, i) => {
          if (!blade) return;
          const proxy = { r: R_INNER_OPEN };
          tl.to(
            proxy,
            {
              r: R_INNER_CLOSED,
              duration: 0.4,
              ease: 'power3.in',
              onUpdate: () => {
                blade.setAttribute('points', bladePoints(i, proxy.r));
              },
            },
            i * 0.02,
          );
        });

        // Brand
        tl.to(brandRef.current, {
          opacity: 1,
          duration: 0.05,
          ease: 'none',
        });

        // Hold
        const holdLabel = 'hold';
        tl.addLabel(holdLabel);
        tl.call(
          async () => {
            tl.pause();
            if (onMidpoint) await onMidpoint();
            tl.resume();
          },
          [],
          holdLabel + '+=0.1',
        );

        // Open
        tl.to(
          brandRef.current,
          { opacity: 0, duration: 0.08, ease: 'none' },
          '+=0.05',
        );

        bladeRefs.current.forEach((blade, i) => {
          if (!blade) return;
          const proxy = { r: R_INNER_CLOSED };
          tl.to(
            proxy,
            {
              r: R_INNER_OPEN,
              duration: 0.5,
              ease: 'power2.out',
              onUpdate: () => {
                blade.setAttribute('points', bladePoints(i, proxy.r));
              },
            },
            `-=${0.48 - i * 0.02}`,
          );
        });
      });
    },
    [],
  );

  useImperativeHandle(ref, () => ({ triggerTransition }), [triggerTransition]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: isOpen ? 'none' : 'auto',
        opacity: isOpen ? 0 : 1,
        transition: 'opacity 0.05s',
      }}
    >
      <rect width={VIEWBOX} height={VIEWBOX} fill="#0A0A0A" />

      {Array.from({ length: BLADE_COUNT }).map((_, i) => (
        <polygon
          key={i}
          ref={(el) => {
            bladeRefs.current[i] = el;
          }}
          points={bladePoints(i, R_INNER_OPEN)}
          fill="#141414"
          stroke="#1E1E1E"
          strokeWidth="1.5"
        />
      ))}

      <text
        ref={brandRef}
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#E8632B"
        fontFamily="'Outfit', sans-serif"
        fontWeight="700"
        fontSize="80"
        style={{ opacity: 0, letterSpacing: '0.02em' }}
      >
        Abi
      </text>
    </svg>
  );
});

export { ApertureTransition };
export default ApertureTransition;
