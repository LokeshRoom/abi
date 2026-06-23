# Project Overview

Welcome to the **ABI Photo Studio** documentation. This project is a modern, high-performance web application designed for professional photography studios. It combines a visually striking showcase portfolio with full-fledged administrative tools for client management, booking scheduling, and private proofing galleries.

---

## Core Vision & Purpose

The ABI Photo Studio platform serves as both a high-fidelity marketing portfolio and a utility portal:
1. **Interactive Showcase:** Provides prospects with a smooth, immersive visual experience (smooth scrolling, custom animations, 3D floating scenes, and cinematic transitions).
2. **Client Proofing & Selection:** Secure, private galleries where clients can review raw photographs, select photos they want processed, and leave feedback on individual images.
3. **Studio Operations:** Backend tools for booking sessions, reviewing contact submissions, publishing articles, and managing client galleries.

---

## Key Feature Directory

### 1. Photography Showcase & Filtering
- **Dynamic Portfolio Grid:** Users can filter photographs by categories (e.g., portraits, cinematic, landscape, events) with smooth, hardware-accelerated transitions.
- **Full-Screen Lightbox:** Responsive touch-and-keyboard-enabled lightbox featuring detailed EXIF metadata extraction (aperture, lens, focal length, ISO, shutter speed) for photography enthusiasts.
- **Cinematic Transitions:** Custom viewport-aware components including an aperture transition effect, viewport frame overlays, film-strip timelines, and neon logo reveals.

### 2. Client Proofing Portal
- **Password-Protected Galleries:** Access controls for private client folders with optional auto-expiration.
- **Selection Workflow:** Clients can star/select photos for final touch-ups, add detailed notes per photo, and submit their selection to the studio.
- **Granular Permissions:** Admins assign specific gallery access permissions to authenticated client users.

### 3. Studio Admin Dashboard
- **Galleries Manager:** Upload photos directly to Vercel Blob, assign categories, tag featured images, and generate private access links.
- **Booking Engine Client:** Admins review incoming event dates, filter events by type (e.g., wedding, product, portrait), and toggle booking statuses (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- **Reviews & Testimonials Manager:** Review and select which client testimonials are featured on the homepage.
- **Contact & Inquiry Inbox:** Simple, centralized list of customer messages with read/unread tracking.

---

## User Roles & Permissions

The application distinguishes between two primary user roles configured via the database:
- `ADMIN`: Full access to the Admin Dashboard (`/admin`), gallery creation, booking moderation, upload endpoints, and blog settings.
- `CLIENT`: Private access to assigned proofing galleries (`/proofing/[slug]`), selection workflows, and profile pages. Unauthenticated visitors can view public pages (home, blog, contact, public galleries).

---

## Technical Pillars

- **Next.js 16 (App Router):** Utilizes Server Components (RSCs) by default for fast page loading and SEO, with client-side interactive subtrees.
- **Prisma & PostgreSQL:** Strong schema relationships ensuring integrity between galleries, photos, bookings, and user selections.
- **Aesthetic Motion (GSAP + Framer Motion + R3F):** Smooth scrolling through Lenis provider coupled with R3F 3D floating photo scenes.

---

*For detailed setup instructions, please consult the [Setup Guide](./setup.md).*
