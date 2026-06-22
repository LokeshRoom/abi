# Abi Photography Studio & Visual Journal

A premium, modern, and fully dynamic web application built for **Abi Photography Studio**. It features a glassmorphic dark-themed portfolio, private client galleries, booking request system, testimonials management, and a dynamic blog engine.

## 🚀 Key Features

* **Visual Portfolio**: Glassmorphic, highly responsive image grid displaying curated street, cinematic, event, and portrait photography.
* **Private Client Galleries**: Admin can create galleries, upload high-resolution photos, and assign access permissions to specific clients. Clients can log in to view and download their private shoots.
* **Booking & Contact Console**: Visitors can submit booking requests and contact inquiries. Admins manage and update booking statuses (Pending, Approved, Rejected) from a private dashboard.
* **Testimonials Manager**: Create, feature, or delete client reviews that dynamically rotate on the homepage.
* **Blog / Journal**: A fully functional blogging engine supporting drafts, immediate publishing, auto slug-generation, cover image uploads, and rendering of headers, bullets, and paragraphs.
* **Admin Dashboard**: Comprehensive control center for managing bookings, inquiries, galleries, reviews, client accounts, and blog posts.
* **Secure Auth Flow**: Seamless authentication using `@supabase/ssr` cookies and Next.js middleware router protection.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js App Router (React, TypeScript)
* **Styling**: Tailwind CSS (custom dark brown palette, warm orange accents, and glassmorphic designs)
* **Database & ORM**: Supabase (PostgreSQL) and Prisma ORM
* **Authentication**: Supabase SSR (Session & Cookie storage)
* **File Storage**: Vercel Blob API (for cover images, gallery photos)

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root of the project and populate the following values:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Supabase Credentials (SSR Client / Middleware)
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Vercel Blob Token (for uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
Initialize the Supabase database schema via Prisma:
```bash
npx prisma db push
```

### 3. Seed Default Data
Seed the database with categories, testimonials, a default admin account, and an introductory blog post:
```bash
npx prisma db seed
```
> **Default Admin Account:**
> * **Email:** `admin@abiphotostudio.com`
> * **Password:** `password123` *(Note: Change the password in production or Supabase console).*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
├── app/
│   ├── admin/             # Admin dashboards (Blogs, Bookings, Clients, Reviews, Galleries)
│   ├── api/               # Serverless API routes (Authentication, Admin actions, Uploads)
│   ├── blog/              # Public blog listing & dynamic reader routes
│   ├── booking/           # Public booking page
│   ├── portfolio/         # Curated instagram & category photo grids
│   ├── login/             # Dynamic login console
│   └── layout.tsx         # Root layout with brand styles
├── components/            # UI components (admin clients, modals, layout elements)
├── lib/                   # Shared database clients and auth config
├── prisma/
│   ├── schema.prisma      # Supabase database models
│   └── seed.ts            # Seeding scripts (Users, Blog posts, Testimonials)
├── public/                # Static assets, fonts, local photos
├── utils/                 # Supabase client helpers (client, server, admin-sdk)
├── middleware.ts          # Page and API route protection middleware
└── tailwind.config.ts     # Brand styling theme tokens
```

---

## 📦 Production Build & Deployment

To verify and run a production build locally:
```bash
npm run build
npm run start
```

### Deploying to Vercel
1. Link your GitHub repository to Vercel.
2. In the Vercel dashboard, add all the environment variables from `.env.local`.
3. Set the **Build Command** to: `prisma generate && next build`
4. Set the **Install Command** to: `npm install`
5. Deploy.
