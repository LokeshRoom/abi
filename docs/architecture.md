# Technical Architecture

This document outlines the system architecture, directory structures, and core tech stack of the ABI Photo Studio project.

## System Architecture Diagram

The diagram below details the module relationships, database integrations, and third-party services in the application:

```mermaid
flowchart TD
    %% Styling
    classDef client fill:#e8632b,stroke:#333,stroke-width:1px,color:#fff;
    classDef server fill:#3b5dad,stroke:#333,stroke-width:1px,color:#fff;
    classDef storage fill:#a8d841,stroke:#333,stroke-width:1px,color:#000;
    
    %% Clientside Components
    subgraph Client ["Client Side (React 19 & Next.js Client Components)"]
        A["Browser / Viewport"] ::: client
        B["SmoothScroll (Lenis)"] ::: client
        C["Animations (GSAP & Framer Motion)"] ::: client
        D["Interactive Components (ui, cinematic, admin)"] ::: client
    end

    %% Serverside Components
    subgraph ServerSide ["Server Side (Next.js App Router & Server Components)"]
        E["Next.js Pages & Layouts (app/*)"] ::: server
        F["API Routes (app/api/*)"] ::: server
        G["Next-Auth Middleware"] ::: server
    end

    %% Database & Services
    subgraph DataServices ["Database & External Services"]
        H[("PostgreSQL (Database)")] ::: storage
        I["Prisma Client ORM"] ::: server
        J["Supabase Client (Auth & Server Client)"] ::: storage
        K["Vercel Blob Storage"] ::: storage
        L["Resend (Email Service)"] ::: storage
    end

    %% Relationships
    A --> B
    A --> C
    A --> D
    D --> E
    E --> F
    F --> G
    E --> I
    F --> I
    I --> H
    F --> J
    F --> K
    F --> L
```

---

## Technical Stack & Libraries

The ABI photo studio application uses the following technology stack:

### Core Frameworks
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) for server-side rendering, routing, and APIs.
- **Library:** [React 19](https://react.dev/) for component-based user interfaces.
- **Language:** [TypeScript](https://www.typescriptlang.org/) for compile-time type safety.

### Database & Authentication
- **ORM:** [Prisma ORM](https://www.prisma.io/) using a PostgreSQL adapter.
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) for user authentication, coupled with [Supabase Auth](https://supabase.com/docs/guides/auth) for third-party OAuth/client-side tokens.
- **Storage:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for uploading and serving photography files.

### Animation & Smooth Scrolling
- **Smooth Scroll:** [Lenis](https://lenis.darkroom.engineering/) for standardizing kinetic scrolling experiences across browsers.
- **Complex Timeline Animations:** [GSAP (GreenSock Animation Platform)](https://gsap.com/) and `@gsap/react` for timing-critical animations.
- **Spring & Micro-interactions:** [Framer Motion](https://www.framer.com/motion/) for fluid page transitions, gestures, and hover effects.
- **3D Graphics:** [Three.js](https://threejs.org/) integrated via [@react-three/fiber](https://r3f.docs.pmnd.rs/) and [@react-three/drei](https://github.com/pmndrs/drei) for immersive landing page scenes.

---

## Directory Structure & Module Responsibilities

The codebase is organized into modular directories with clear separation of concerns:

| Directory | Primary Responsibility |
|---|---|
| [`app/`](file:///d:/workspace/abi/app) | Routing, layouts, and page entrypoints. Uses Route Groups like `(proofing)` for client review workflows. |
| [`components/`](file:///d:/workspace/abi/components) | Reusable React components. |
| ├─ [`admin/`](file:///d:/workspace/abi/components/admin) | Client galleries, bookings, reviews, and blog admin management dashboards. |
| ├─ [`cinematic/`](file:///d:/workspace/abi/components/cinematic) | Custom cinematic photography elements (aperture transitions, viewfinder overlays, focus pull cards). |
| ├─ [`layout/`](file:///d:/workspace/abi/components/layout) | Application shells, headers, footers, and providers (Lenis, Theme). |
| ├─ [`three/`](file:///d:/workspace/abi/components/three) | Three.js scenes, meshes, and floating card canvases. |
| └─ [`ui/`](file:///d:/workspace/abi/components/ui) | Fundamental primitives (lightbox, magnetic cursor, confetti). |
| [`lib/`](file:///d:/workspace/abi/lib) | Shared backend & client libraries (Auth configurations, Prisma Client initialization, constants, Tailwind merging helper). |
| [`utils/`](file:///d:/workspace/abi/utils) | Helper modules, specifically Supabase client/server instantiations. |
| [`prisma/`](file:///d:/workspace/abi/prisma) | Database schemas, seed scripts, and migration files. |
| [`public/`](file:///d:/workspace/abi/public) | Static media assets, icons, and wordmarks. |

---

## Database Architecture (Prisma Schema)

The database schema models photography studio workflows (User Accounts, Category organization, Galleries, Photo Selection lists, Blog posts, Bookings, Testimonials, and Contact Forms):

- **User**: Represents client and administrator accounts with enum roles (`ADMIN` or `CLIENT`).
- **Photo**: Captures upload URLs, width, height, and EXIF metadata (camera, aperture, ISO, exposure time) for gallery renders.
- **Gallery**: Grouping of Photos. Supports password protection (`password`) and expiration dates (`expiresAt`) for secure client proofing.
- **PhotoSelection**: Tracks selections/comments made by clients inside proofing galleries.
- **Booking**: Customer event details (event date, type, status like `PENDING` or `CONFIRMED`).
- **BlogPost**: Core records for the photography studio blog.

*Generated automatically. Run `npm run doc:all` to update.*
