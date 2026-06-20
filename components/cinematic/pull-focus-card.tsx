'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, type Transition } from 'framer-motion';

/* ═══════════════════════════════════════════════════════
   PULL-FOCUS CARD — Depth-of-field hover effect
   ═══════════════════════════════════════════════════════ */

// ── Types ──────────────────────────────────────────────
interface ExifData {
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
}

interface PullFocusCardProps {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
  exif?: ExifData;
  /** Currently hovered card id from parent. `null` = nothing hovered. */
  hoveredId: string | null;
  /** Notify parent on hover enter. */
  onHoverStart: (id: string) => void;
  /** Notify parent on hover leave. */
  onHoverEnd: (id: string) => void;
  /** Optional click handler. */
  onClick?: (id: string) => void;
}

// ── Spring configs ─────────────────────────────────────
const SPRING_FOCUS_IN: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

const SPRING_FOCUS_OUT: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
  mass: 1,
};

// ── Visual state helpers ───────────────────────────────
type FocusState = 'idle' | 'focused' | 'background';

function getFocusState(
  id: string,
  hoveredId: string | null,
): FocusState {
  if (hoveredId === null) return 'idle';
  if (hoveredId === id) return 'focused';
  return 'background';
}

const stateStyles: Record<
  FocusState,
  { filter: string; scale: number; opacity: number }
> = {
  idle: { filter: 'blur(1.5px)', scale: 0.98, opacity: 1 },
  focused: { filter: 'blur(0px)', scale: 1, opacity: 1 },
  background: { filter: 'blur(4px)', scale: 0.96, opacity: 0.6 },
};

// ── Card component ─────────────────────────────────────
export function PullFocusCard({
  id,
  src,
  alt,
  width,
  height,
  blurDataUrl,
  exif,
  hoveredId,
  onHoverStart,
  onHoverEnd,
  onClick,
}: PullFocusCardProps) {
  const state = getFocusState(id, hoveredId);
  const style = stateStyles[state];
  const isFocused = state === 'focused';

  const transition =
    state === 'focused' ? SPRING_FOCUS_IN : SPRING_FOCUS_OUT;

  return (
    <motion.div
      layout
      onHoverStart={() => onHoverStart(id)}
      onHoverEnd={() => onHoverEnd(id)}
      onClick={() => onClick?.(id)}
      animate={{
        filter: style.filter,
        scale: style.scale,
        opacity: style.opacity,
      }}
      transition={transition}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '4px',
        cursor: 'pointer',
        willChange: 'filter, transform',
        transformOrigin: 'center center',
      }}
      role="figure"
      aria-label={alt}
    >
      {/* ── Photo ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${width} / ${height}`,
          overflow: 'hidden',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder={blurDataUrl ? 'blur' : 'empty'}
          blurDataURL={blurDataUrl}
          style={{
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isFocused ? 'scale(1.03)' : 'scale(1)',
          }}
        />

        {/* ── Viewfinder corner brackets ── */}
        <motion.div
          initial={false}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Top-left */}
          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 24,
              height: 24,
              borderTop: '2px solid var(--accent, #FAFAFA)',
              borderLeft: '2px solid var(--accent, #FAFAFA)',
            }}
          />
          {/* Top-right */}
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 24,
              height: 24,
              borderTop: '2px solid var(--accent, #FAFAFA)',
              borderRight: '2px solid var(--accent, #FAFAFA)',
            }}
          />
          {/* Bottom-left */}
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              width: 24,
              height: 24,
              borderBottom: '2px solid var(--accent, #FAFAFA)',
              borderLeft: '2px solid var(--accent, #FAFAFA)',
            }}
          />
          {/* Bottom-right */}
          <span
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              width: 24,
              height: 24,
              borderBottom: '2px solid var(--accent, #FAFAFA)',
              borderRight: '2px solid var(--accent, #FAFAFA)',
            }}
          />
        </motion.div>

        {/* ── Focus elevation shadow ── */}
        <motion.div
          initial={false}
          animate={{
            boxShadow: isFocused
              ? '0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)'
              : '0 4px 12px rgba(0,0,0,0.2)',
          }}
          transition={transition}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />

        {/* ── EXIF data overlay ── */}
        {exif && (
          <motion.div
            initial={false}
            animate={{
              opacity: isFocused ? 1 : 0,
              y: isFocused ? 0 : 8,
            }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 14px 10px',
              background:
                'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.04em',
                color: 'rgba(250, 250, 250, 0.8)',
                textTransform: 'uppercase',
              }}
            >
              {exif.aperture && <span>ƒ/{exif.aperture}</span>}
              {exif.shutter && <span>{exif.shutter}s</span>}
              {exif.iso && <span>ISO {exif.iso}</span>}
              {exif.focalLength && <span>{exif.focalLength}mm</span>}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Grid parent component ──────────────────────────────
interface PullFocusGridProps {
  children: (props: {
    hoveredId: string | null;
    onHoverStart: (id: string) => void;
    onHoverEnd: (id: string) => void;
  }) => ReactNode;
  /** Grid CSS class override. */
  className?: string;
}

/**
 * Convenience wrapper that manages the `hoveredId` state
 * and passes it down via render-prop.
 *
 * @example
 * ```tsx
 * <PullFocusGrid>
 *   {({ hoveredId, onHoverStart, onHoverEnd }) =>
 *     photos.map(p => (
 *       <PullFocusCard
 *         key={p.id} id={p.id}
 *         hoveredId={hoveredId}
 *         onHoverStart={onHoverStart}
 *         onHoverEnd={onHoverEnd}
 *         {...p}
 *       />
 *     ))
 *   }
 * </PullFocusGrid>
 * ```
 */
export function PullFocusGrid({
  children,
  className = '',
}: PullFocusGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const onHoverStart = useCallback((id: string) => setHoveredId(id), []);
  const onHoverEnd = useCallback(
    (id: string) =>
      setHoveredId((prev) => (prev === id ? null : prev)),
    [],
  );

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      {children({ hoveredId, onHoverStart, onHoverEnd })}
    </div>
  );
}

export default PullFocusCard;
