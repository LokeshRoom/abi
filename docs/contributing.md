# Contributing Guidelines

Thank you for contributing to the ABI Photo Studio project. To maintain code quality, consistency, and ensure our documentation stays up to date, please follow these guidelines.

---

## 1. Development Workflow

1. **Branch Naming:** Use clear branch prefix conventions:
   - `feature/` for new features (e.g. `feature/booking-calendar`)
   - `bugfix/` for bug fixes (e.g. `bugfix/lightbox-arrow-keys`)
   - `docs/` for documentation updates (e.g. `docs/setup-secrets`)
2. **Pull Requests:** Ensure your PR description lists the changes, testing steps, and mentions any related issues.
3. **Commit Messages:** Follow basic conventional commits:
   - `feat: add client photo rating`
   - `fix: correct exif aperture parser`
   - `docs: update deployment guidelines`

---

## 2. Code Standards & Linting

We enforce strict linting and formatting rules to ensure consistency across the project:

### Linting
The project uses ESLint with Next.js configurations. Run the linter locally before committing:
```bash
npm run lint
```
Code will not build or deploy if there are linting errors.

### Formatting
- Use Prettier/standard formatting rules (semi: true, tabWidth: 2, singleQuote: true).
- Organize imports logically: React/Next first, followed by third-party packages, components, and finally local utils/constants.

### React & TypeScript Guidelines
- **Strict Typing:** Avoid using `any`. Define proper interfaces/types for all variables and props.
- **RSC vs Client Components:** By default, keep components as React Server Components (RSC). Only add `"use client"` at the top of files that utilize state hook variables (`useState`, `useEffect`), handlers (`onClick`), or animation libraries (GSAP, Framer Motion).
- **Custom Hooks:** Place reusable client state logic inside custom hooks in `hooks/` to keep UI rendering code clean.

---

## 3. Database Modifications (Prisma)

If you modify the database schema:
1. Make your changes inside [`prisma/schema.prisma`](file:///d:/workspace/abi/prisma/schema.prisma).
2. Generate a local migration and test it against your local database:
   ```bash
   npx prisma migrate dev --name <your_migration_description>
   ```
3. Regenerate the Prisma Client:
   ```bash
   npx prisma generate
   ```
4. If you added new relations or models, update the seed script in [`prisma/seed.ts`](file:///d:/workspace/abi/prisma/seed.ts) to populate mock data for testing.

---

## 4. Documentation Maintenance (Critical)

We maintain living technical documentation. If your code changes add, remove, or modify components or alter the general architecture:

> [!IMPORTANT]
> **Regenerate Documentation Before Committing**
> You MUST run the documentation generator scripts to ensure that `components.md` and `architecture.md` are synchronized with your code changes.
>
> Run the following command:
> ```bash
> npm run doc:all
> ```
> Review the diffs of generated markdown files in `docs/` before committing.
