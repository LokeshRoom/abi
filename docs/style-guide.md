# Visual & Coding Style Guide

This style guide documents the design system, styling guidelines, and animation standards used across the ABI Photo Studio project.

---

## 1. Dual-Mode Theming System

The application operates in two distinct modes configured via global CSS tokens:
1. **Gallery Mode (Default):** Neutral, photos-first mode with high contrast and transparent/white accents. This keeps the focus entirely on the photography content.
2. **Brand Mode (`[data-theme="brand"]`):** Vibrant, high-energy theme highlighting orange, green, and blue accents. Perfect for landing pages, branding sections, and administrative dashboards.

### Theme Color Variables

| CSS Token | Gallery Mode (Default) | Brand Mode (`[data-theme="brand"]`) |
|---|---|---|
| `--bg-primary` | `#0A0A0A` (Neutral Black) | `#0A0A0A` (Neutral Black) |
| `--bg-secondary` | `#111111` (Very Dark Gray) | `#1A0E08` (Dark Warm Brown) |
| `--bg-card` | `#1A1A1A` | `#1A1A1A` |
| `--border` | `#2A2A2A` | `rgba(232, 99, 43, 0.2)` (Translucent Orange) |
| `--text-primary` | `#FAFAFA` (Off-white) | `#FAFAFA` (Off-white) |
| `--text-secondary`| `#888888` | `#CCCCCC` |
| `--accent` | `#FAFAFA` | `#E8632B` (Brand Orange) |
| `--accent-secondary`| `#888888` | `#A8D841` (Brand Green) |
| `--accent-glow` | `transparent` | `rgba(232, 99, 43, 0.25)` |

---

## 2. Typography

The application uses Google Fonts configured in Next.js:
- **Primary Body/Interface Font:** `Outfit` (sans-serif) - used for standard body text, headers, and UI elements.
- **Monospace/Technical Font:** `JetBrains Mono` (monospace) - used for EXIF details, labels, timestamps, counter numbers, and code blocks.

### Fluid Typography Scale
We use CSS `clamp()` to scale font sizes dynamically based on the viewport, eliminating the need for rigid media queries:

- **Hero Size (`--text-hero`):** `clamp(3rem, 2.2rem + 4vw, 7rem)`
- **Header Large (`--text-3xl`):** `clamp(2.074rem, 1.77rem + 1.52vw, 3.052rem)`
- **Standard Body (`--text-base`):** `clamp(1rem, 0.93rem + 0.36vw, 1.25rem)`
- **Caption/Technical (`--text-xs`):** `clamp(0.694rem, 0.66rem + 0.18vw, 0.8rem)`

---

## 3. Cinematic Utilities

Special utility classes are available in `app/globals.css` to add character and premium texture:

### `.film-grain`
Adds a subtle, moving fractal noise grain over backgrounds to emulate vintage camera film. Include this in section wrappers (e.g. Hero background).

### `.font-technical`
Applies uppercase styling, JetBrains Mono font face, and letter-spacing to render metadata values:
```tsx
<span className="font-technical">ISO 100</span>
```

### `.viewfinder-corner`
Draws mechanical camera viewfinder brackets at the corners of elements upon hovering. Extremely effective for interactive card outlines.

### `.glass` & `.glass-card`
Implements premium frosted glassmorphism cards with smooth hover transitions, box shadows, and glow borders:
```tsx
<div className="glass-card rounded-lg p-6">
  {/* Content */}
</div>
```

### `.glitch-text`
Generates a double-offset color glitch text effect (orange and blue offsets) using CSS pseudoclasses. Use sparingly on hero keywords.

---

## 4. Animation & Motion Standards

To ensure premium aesthetics, follow these motion guidelines:

### Spring Configurations (Framer Motion)
Avoid linear animations. Use spring physics for physical interactions (hover, scale, slide):
```typescript
export const SPRING_FOCUS = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};
```

### GSAP Timelines
For complex synchronized multi-step animations (such as page loads, logo reveals, or custom scroll-triggered sequences), use GSAP timelines inside the `@gsap/react` hook context for resource cleanup.

### Performance Guidelines
- Always animate `transform` (scale, translate) and `opacity` rather than structural layout values (`width`, `height`, `margin`).
- Apply `will-change: transform` or `will-change: filter` to complex animated 3D components.
- Wrap Three.js 3D viewport scenes in a React `Suspense` boundary to prevent blocking the UI thread.
