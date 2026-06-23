# Deployment Guide

This guide details the steps required to deploy the ABI Photo Studio application to a production environment. The recommended stack is **Vercel** for hosting the Next.js frontend and serverless functions, and **Supabase** or another PostgreSQL provider for the database.

---

## 1. Database Provisioning (PostgreSQL)

If using Supabase to host your database:
1. Create a new project in the [Supabase Dashboard](https://database.new).
2. Go to **Project Settings** > **Database** to copy your connection strings:
   - **Transaction URL (Port 5432):** Use this for standard database interactions (e.g. Next.js serverless functions).
   - **Session URL (Port 5432 or pooling proxy):** Recommended connection pooling URL if using Serverless deployments.
3. Make sure database connections do not exceed pool limits.

---

## 2. Media Storage (Vercel Blob)

The application uses Vercel Blob for direct client uploads in the admin dashboard:
1. Go to your project page in the [Vercel Dashboard](https://vercel.com).
2. Navigate to the **Storage** tab.
3. Select **Create Database** and choose **Blob**.
4. Link the Blob storage store to your Vercel project. This automatically injects the `BLOB_READ_WRITE_TOKEN` environment variable into your deployment.

---

## 3. Environment Variables Config

Add the following environment variables in your Vercel Project Settings (**Settings** > **Environment Variables**):

| Key | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection URL. Add `?pgbouncer=true` if using connection poolers. | `postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption. Generate a secure key using `openssl rand -base64 32`. | `dGhpcy1pcy1hLXNlY3JldC1rZXktdmFsdWU=` |
| `NEXTAUTH_URL` | Public URL of your deployed application. | `https://abi-photo-studio.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public URL of your Supabase API gateway. | `https://xzyabc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for Supabase client calls. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Private admin key for Supabase server actions. | `eyJhbGciOiJIUzI1NiIsInR5...` |
| `RESEND_API_KEY` | API token from Resend.com for booking validation/contact notifications. | `re_123456789` |

---

## 4. Build Configuration

Next.js is configured to automatically generate the Prisma Client code on every build. In `package.json`, the build script is defined as:

```json
"build": "prisma generate && next build"
```

Vercel will run this command automatically. You do not need to adjust the Build and Development Settings in Vercel.

---

## 5. Running Database Migrations in CI/CD

Before deploying changes, you must apply database migrations. There are two primary strategies:

### Option A: Serverless Build Integration (Recommended)
Add a Prisma migration step to the build process in `package.json` to ensure your database stays in sync with your codebase releases automatically:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

### Option B: Manual Command Execution
Deploy migrations manually before pushing releases:

```bash
# Deploys outstanding migrations to your production database
npx prisma migrate deploy
```
