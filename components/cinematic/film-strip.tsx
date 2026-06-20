'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Image from 'next/image';

/* ═══════════════════════════════════════════════════════
   FILM STRIP — Kinetic horizontal scroll gallery
   ═══════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────
interface FilmPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface FilmStripProps {
  photos: FilmPhoto[];
  /** Height of the film strip in px. @default 420 */
  height?: number;
  /** Film grain intensity (0–1). @default 0.04 */
  grainOpacity?: number;
  /** Optional className for the outer wrapper. */
  className?: string;
}

// ── Physics constants ──────────────────────────────────
const FRICTION = 0.94; // velocity decay per frame
const VELOCITY_THRESHOLD = 0.3; // px/frame — below this, stop
const SNAP_SPRING = 0.08; // spring force toward snap target
const SNAP_DAMPING = 0.7; // damping for snap animation
const VELOCITY_SCALE = 0.8; // scale pointer velocity

// ── Sprocket hole SVG pattern (encoded) ────────────────
const SPROCKET_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='40'%3E%3Crect x='8' y='12' width='12' height='16' rx='3' fill='%23111'/%3E%3Crect x='9' y='13' width='10' height='14' rx='2' fill='%230A0A0A'/%3E%3C/svg%3E")`;

// ── Component ──────────────────────────────────────────
export function FilmStrip({
  photos,
  height = 420,
  grainOpacity = 0.04,
  className = '',
}: FilmStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const prefersReduced = useRef(false);

  // Dragging state (non-reactive for perf)
  const drag = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    velocity: 0,
    prevX: 0,
    prevTime: 0,
    isAnimating: false,
  });

  const [progress, setProgress] = useState(0);

  // Detect reduced motion
  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  // ── Progress bar update ──
  const updateProgress = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) {
      setProgress(0);
      return;
    }
    setProgress(track.scrollLeft / maxScroll);
  }, []);

  // ── Parallax update ──
  const updateParallax = useCallback(() => {
    if (prefersReduced.current) return;
    const track = trackRef.current;
    if (!track) return;

    frameRefs.current.forEach((frame) => {
      if (!frame) return;
      const img = frame.querySelector<HTMLElement>('[data-parallax]');
      if (!img) return;

      const rect = frame.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const centerOffset =
        rect.left +
        rect.width / 2 -
        (trackRect.left + trackRect.width / 2);
      const parallax = centerOffset * 0.1; // 0.9x relative → 0.1 difference
      img.style.transform = `translateX(${-parallax}px)`;
    });
  }, []);

  // ── Scroll listener for progress + parallax ──
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      updateProgress();
      updateParallax();
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial

    return () => {
      track.removeEventListener('scroll', onScroll);
    };
  }, [updateProgress, updateParallax]);

  // ── Find nearest snap target ──
  const findSnapTarget = useCallback((): number => {
    const track = trackRef.current;
    if (!track || frameRefs.current.length === 0) return track?.scrollLeft ?? 0;

    const trackCenter = track.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;

    frameRefs.current.forEach((frame) => {
      if (!frame) return;
      const frameCenter =
        frame.offsetLeft + frame.offsetWidth / 2 - track.scrollLeft;
      const dist = Math.abs(frameCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = frame.offsetLeft + frame.offsetWidth / 2 - trackCenter;
      }
    });

    // Clamp
    const maxScroll = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(closest, maxScroll));
  }, []);

  // ── Inertia + snap animation ──
  const animateInertia = useCallback(() => {
    const track = trackRef.current;
    const d = drag.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    let snapTarget: number | null = null;
    let snapVelocity = 0;

    const tick = () => {
      if (d.isDragging) {
        d.isAnimating = false;
        return;
      }

      const currentScroll = track.scrollLeft;

      if (Math.abs(d.velocity) > VELOCITY_THRESHOLD) {
        // Momentum phase
        track.scrollLeft += d.velocity;
        d.velocity *= FRICTION;

        // Boundary bounce
        if (track.scrollLeft <= 0 || track.scrollLeft >= maxScroll) {
          d.velocity *= -0.3;
          track.scrollLeft = Math.max(0, Math.min(track.scrollLeft, maxScroll));
        }

        updateProgress();
        updateParallax();
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap phase
        if (snapTarget === null) {
          snapTarget = findSnapTarget();
          snapVelocity = 0;
        }

        const diff = snapTarget - currentScroll;
        if (Math.abs(diff) < 0.5) {
          track.scrollLeft = snapTarget;
          d.isAnimating = false;
          updateProgress();
          updateParallax();
          return;
        }

        snapVelocity = (snapVelocity + diff * SNAP_SPRING) * SNAP_DAMPING;
        track.scrollLeft += snapVelocity;

        updateProgress();
        updateParallax();
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    d.isAnimating = true;
    rafRef.current = requestAnimationFrame(tick);
  }, [findSnapTarget, updateProgress, updateParallax]);

  // ── Pointer handlers ──
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;

      cancelAnimationFrame(rafRef.current);

      const d = drag.current;
      d.isDragging = true;
      d.startX = e.clientX;
      d.scrollLeft = track.scrollLeft;
      d.velocity = 0;
      d.prevX = e.clientX;
      d.prevTime = performance.now();

      track.setPointerCapture(e.pointerId);
      track.style.cursor = 'grabbing';
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.isDragging) return;

      const track = trackRef.current;
      if (!track) return;

      const now = performance.now();
      const dx = e.clientX - d.prevX;
      const dt = now - d.prevTime;

      if (dt > 0) {
        d.velocity = (-dx / dt) * 16 * VELOCITY_SCALE; // normalize to ~60fps
      }

      d.prevX = e.clientX;
      d.prevTime = now;

      const walk = e.clientX - d.startX;
      track.scrollLeft = d.scrollLeft - walk;

      updateProgress();
      updateParallax();
    },
    [updateProgress, updateParallax],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      const d = drag.current;
      if (!track || !d.isDragging) return;

      d.isDragging = false;
      track.releasePointerCapture(e.pointerId);
      track.style.cursor = 'grab';

      if (prefersReduced.current) {
        // Instant snap
        const target = findSnapTarget();
        track.scrollLeft = target;
        updateProgress();
        updateParallax();
      } else {
        animateInertia();
      }
    },
    [animateInertia, findSnapTarget, updateProgress, updateParallax],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Frame sizing ──
  const frameHeight = height - 48; // subtract top/bottom sprocket rows
  const frameWidth = (frameHeight * 3) / 2; // 3:2 aspect ratio

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Film strip track ── */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          height,
          overflowX: 'auto',
          overflowY: 'hidden',
          cursor: 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          background: '#111',
          touchAction: 'pan-y',
          position: 'relative',
        }}
      >
        {/* ── Top sprocket row ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 24,
            backgroundImage: SPROCKET_PATTERN,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '28px 24px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* ── Bottom sprocket row ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 24,
            backgroundImage: SPROCKET_PATTERN,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '28px 24px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* ── Film grain overlay ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: grainOpacity,
            pointerEvents: 'none',
            zIndex: 3,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            mixBlendMode: 'overlay',
          }}
        />

        {/* ── Leading spacer ── */}
        <div
          style={{
            minWidth: '50vw',
            height: 1,
            flexShrink: 0,
          }}
        />

        {/* ── Photo frames ── */}
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            style={{
              flexShrink: 0,
              width: frameWidth,
              height: frameHeight,
              margin: '0 6px',
              position: 'relative',
              borderLeft: '4px solid #1A1A1A',
              borderRight: '4px solid #1A1A1A',
              background: '#0A0A0A',
              overflow: 'hidden',
            }}
          >
            {/* Film frame number */}
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.55rem',
                color: 'rgba(232, 99, 43, 0.5)',
                zIndex: 1,
                letterSpacing: '0.08em',
              }}
            >
              {String(i + 1).padStart(2, '0')}A
            </span>

            {/* Photo with parallax wrapper */}
            <div
              data-parallax
              style={{
                position: 'absolute',
                inset: '-5%',
                width: '110%',
                height: '110%',
                willChange: 'transform',
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={`${frameWidth}px`}
                style={{ objectFit: 'cover' }}
                draggable={false}
              />
            </div>
          </div>
        ))}

        {/* ── Trailing spacer ── */}
        <div
          style={{
            minWidth: '50vw',
            height: 1,
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── Progress bar ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'rgba(26, 26, 26, 0.8)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: `${Math.max(progress * 100, 1)}%`,
            height: '100%',
            background: '#E8632B',
            transition: drag.current.isDragging
              ? 'none'
              : 'width 0.15s ease-out',
            boxShadow: '0 0 8px rgba(232, 99, 43, 0.4)',
          }}
        />
      </div>

      {/* ── Hide native scrollbar ── */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default FilmStrip;
