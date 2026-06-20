'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* ═══════════════════════════════════════════════════════
   VIEWFINDER OVERLAY — Camera HUD overlay
   ═══════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────
interface ViewfinderExif {
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  focalLength?: string;
  camera?: string;
  lens?: string;
}

interface ViewfinderOverlayProps {
  exif?: ViewfinderExif;
  isActive: boolean;
  /** Optional className for the root container. */
  className?: string;
}

// ── Constants ──────────────────────────────────────────
const LINE_COLOR = 'rgba(168, 216, 65, 0.6)';
const LINE_COLOR_DIM = 'rgba(168, 216, 65, 0.25)';
const TEXT_COLOR = 'rgba(168, 216, 65, 0.8)';
const REC_COLOR = '#E8632B';

// ── Component ──────────────────────────────────────────
export function ViewfinderOverlay({
  exif,
  isActive,
  className = '',
}: ViewfinderOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const exifBarRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const prefersReduced = useRef(false);

  // Detect reduced motion
  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
  }, []);

  // Animate in / out
  useEffect(() => {
    tlRef.current?.kill();

    const root = rootRef.current;
    const grid = gridRef.current;
    const corners = cornersRef.current;
    const exifBar = exifBarRef.current;
    const rec = recRef.current;

    if (!root || !grid || !corners || !exifBar || !rec) return;

    const gridLines = grid.querySelectorAll<HTMLElement>('.vf-grid-line');
    const cornerEls = corners.querySelectorAll<HTMLElement>('.vf-corner');
    const exifItems = exifBar.querySelectorAll<HTMLElement>('.vf-exif-item');

    if (prefersReduced.current) {
      // Instant show / hide
      root.style.opacity = isActive ? '1' : '0';
      root.style.pointerEvents = isActive ? 'auto' : 'none';
      gridLines.forEach((l) => (l.style.opacity = '1'));
      cornerEls.forEach((c) => {
        c.style.opacity = '1';
        c.style.width = '32px';
        c.style.height = '32px';
      });
      exifItems.forEach((e) => (e.style.opacity = '1'));
      rec.style.opacity = isActive ? '1' : '0';
      return;
    }

    const tl = gsap.timeline();
    tlRef.current = tl;

    if (isActive) {
      // ── Animate IN ──
      tl.set(root, { opacity: 1, pointerEvents: 'auto' });

      // Grid lines draw in (scale from 0)
      tl.fromTo(
        gridLines,
        { scaleX: 0, scaleY: 0, opacity: 0 },
        {
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.04,
        },
        0,
      );

      // Corners expand
      tl.fromTo(
        cornerEls,
        { width: 12, height: 12, opacity: 0 },
        {
          width: 32,
          height: 32,
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
          stagger: 0.03,
        },
        0.15,
      );

      // EXIF items typewriter
      tl.fromTo(
        exifItems,
        { opacity: 0, x: -6 },
        {
          opacity: 1,
          x: 0,
          duration: 0.08,
          ease: 'none',
          stagger: 0.06,
        },
        0.25,
      );

      // REC dot
      tl.fromTo(
        rec,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' },
        0.3,
      );
    } else {
      // ── Animate OUT ──
      tl.to(
        [gridLines, cornerEls, exifItems, rec],
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          stagger: 0.02,
        },
        0,
      );
      tl.set(root, { opacity: 0, pointerEvents: 'none' }, '+=0');
    }

    return () => {
      tl.kill();
    };
  }, [isActive]);

  // Build EXIF display items
  const exifEntries: { label: string; value: string }[] = [];
  if (exif?.aperture) exifEntries.push({ label: 'ƒ', value: exif.aperture });
  if (exif?.shutterSpeed)
    exifEntries.push({ label: 'SS', value: exif.shutterSpeed });
  if (exif?.iso) exifEntries.push({ label: 'ISO', value: exif.iso });
  if (exif?.focalLength)
    exifEntries.push({ label: 'FL', value: `${exif.focalLength}mm` });
  if (exif?.camera) exifEntries.push({ label: 'CAM', value: exif.camera });
  if (exif?.lens) exifEntries.push({ label: 'LENS', value: exif.lens });

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        opacity: 0,
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
      }}
      aria-hidden="true"
    >
      {/* ── Rule-of-thirds grid ── */}
      <div
        ref={gridRef}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Vertical lines at 1/3, 2/3 */}
        <div
          className="vf-grid-line"
          style={{
            position: 'absolute',
            left: '33.333%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: LINE_COLOR_DIM,
            transformOrigin: 'top center',
            opacity: 0,
          }}
        />
        <div
          className="vf-grid-line"
          style={{
            position: 'absolute',
            left: '66.666%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: LINE_COLOR_DIM,
            transformOrigin: 'top center',
            opacity: 0,
          }}
        />
        {/* Horizontal lines at 1/3, 2/3 */}
        <div
          className="vf-grid-line"
          style={{
            position: 'absolute',
            top: '33.333%',
            left: 0,
            right: 0,
            height: '1px',
            background: LINE_COLOR_DIM,
            transformOrigin: 'center left',
            opacity: 0,
          }}
        />
        <div
          className="vf-grid-line"
          style={{
            position: 'absolute',
            top: '66.666%',
            left: 0,
            right: 0,
            height: '1px',
            background: LINE_COLOR_DIM,
            transformOrigin: 'center left',
            opacity: 0,
          }}
        />
      </div>

      {/* ── Corner brackets ── */}
      <div ref={cornersRef}>
        {/* Top-left */}
        <div
          className="vf-corner"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 12,
            height: 12,
            borderTop: `2px solid ${LINE_COLOR}`,
            borderLeft: `2px solid ${LINE_COLOR}`,
            opacity: 0,
          }}
        />
        {/* Top-right */}
        <div
          className="vf-corner"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 12,
            height: 12,
            borderTop: `2px solid ${LINE_COLOR}`,
            borderRight: `2px solid ${LINE_COLOR}`,
            opacity: 0,
          }}
        />
        {/* Bottom-left */}
        <div
          className="vf-corner"
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            width: 12,
            height: 12,
            borderBottom: `2px solid ${LINE_COLOR}`,
            borderLeft: `2px solid ${LINE_COLOR}`,
            opacity: 0,
          }}
        />
        {/* Bottom-right */}
        <div
          className="vf-corner"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 12,
            height: 12,
            borderBottom: `2px solid ${LINE_COLOR}`,
            borderRight: `2px solid ${LINE_COLOR}`,
            opacity: 0,
          }}
        />
      </div>

      {/* ── REC indicator (top-right) ── */}
      <div
        ref={recRef}
        style={{
          position: 'absolute',
          top: 14,
          right: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: 0,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: REC_COLOR,
            display: 'inline-block',
            animation: isActive
              ? '_vf-rec-pulse 1.2s ease-in-out infinite'
              : 'none',
            boxShadow: `0 0 6px ${REC_COLOR}`,
          }}
        />
        <span
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: REC_COLOR,
            fontWeight: 600,
          }}
        >
          REC
        </span>
      </div>

      {/* ── EXIF bottom bar ── */}
      <div
        ref={exifBarRef}
        style={{
          position: 'absolute',
          bottom: 12,
          left: 44,
          right: 44,
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {exifEntries.map((entry) => (
          <div
            key={entry.label}
            className="vf-exif-item"
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: TEXT_COLOR,
              opacity: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ opacity: 0.5 }}>{entry.label}</span>{' '}
            {entry.value}
          </div>
        ))}
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes _vf-rec-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes _vf-rec-pulse {
            0%, 100% { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </div>
  );
}

export default ViewfinderOverlay;
