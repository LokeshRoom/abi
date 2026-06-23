# Setup Guide

This guide will walk you through the process of setting up and running the ABI Photo Studio project locally.

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** version \`>= 20.x\` (LTS recommended)
- **Package Manager:** \`npm\` (comes with Node) or \`pnpm\`
- **Database:** A running PostgreSQL instance (either local or cloud-hosted via Supabase, Neon, etc.)

---

## Development Setup

Follow these steps to run the application locally:

### 1. Clone & Install
```bash
# Clone the repository
git clone <repo-url>
cd abi

# Install package dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project. Add the following keys with your local/development values:

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/abi_studio?schema=public"

# Next Auth Configuration
NEXTAUTH_SECRET="your-32-character-random-string-secret"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Credentials (for Auth & Storage fallbacks)
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Vercel Blob Storage Token (for media uploads)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-read-write-token"

# Resend API Key (for transactional booking emails)
RESEND_API_KEY="re_yourResendApiKey"
```

### 3. Initialize the Database
Initialize your PostgreSQL database and run the Prisma seeds:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations or push the schema to the database
npx prisma db push

# Seed the database with categories, admin user, blogs, and testimonials
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Seed Data & Credentials

Running `npx prisma db seed` seeds the database with initial categories, mock testimonials, blogs, and a default admin user. 
- **Default Admin Email:** `admin@abi.studio`
- **Default Admin Password:** `admin123` (used for testing in local environment)

> [!CAUTION]
> Remember to change the default admin credentials and password hash when deploying the application to staging or production.

---

## Documentation System

To regenerate the technical architecture diagrams and component references based on your latest codebase modifications, execute:

```bash
# Regenerate component reference & architecture markdown
npm run doc:all

# Or run separately:
npm run doc:components  # Updates docs/components.md
npm run doc:arch        # Updates docs/architecture.md
```
