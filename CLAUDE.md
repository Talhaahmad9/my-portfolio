# CLAUDE.md — talhaahmad.me Portfolio

## Project Overview

Personal portfolio website for **Talha Ahmad** — Full-Stack AI Engineer and CS student at IoBM, Karachi (graduating 2027). The site doubles as a full-stack project: a public-facing portfolio with a private admin panel for content management.

**Live domain:** `talhaahmad.me` (Cloudflare DNS)  
**Deployment:** Vercel  
**Current repo:** `github.com/Talhaahmad9/portfolio`

---

## Tech Stack

| Layer        | Technology                                                  |
| ------------ | ----------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)                          |
| Language     | TypeScript 5 (strict mode)                                  |
| Styling      | Tailwind CSS v4 (`@theme` tokens only, no config file)      |
| Animations   | Framer Motion 12                                            |
| Fonts        | Geist Sans + Geist Mono (next/font)                         |
| Auth         | NextAuth v5 (Credentials provider only — single admin user) |
| Database     | MongoDB Atlas (Mongoose)                                    |
| File Storage | Cloudflare R2 (via `@aws-sdk/client-s3` — S3-compatible)    |
| Validation   | Zod                                                         |
| Hosting      | Vercel                                                      |

---

## Design System

### Color Tokens (Tailwind v4 `@theme`)

```css
--color-black: #000000 /* Primary canvas, body background */
  --color-oxfordBlue: #14213d /* Cards, section dividers, nav border */
  --color-orangeWeb: #fca311 /* Accents, CTAs, links, hover states */
  --color-platinum: #e5e5e5 /* Body text, secondary content */
  --color-white: #ffffff /* Headings, high-emphasis text */;
```

**Rules:**

- Use these tokens exclusively — never raw hex values or arbitrary Tailwind colors
- No gradients anywhere in the design
- Orange (`orangeWeb`) is the single accent color — use sparingly and intentionally

### Typography

- Headings: Geist Sans, `font-semibold`
- Body: Geist Sans, regular weight
- Mono (code snippets only): Geist Mono
- Section labels: `text-sm font-medium uppercase tracking-widest text-orangeWeb`

### Animation Pattern

All scroll-reveal animations use the shared `SectionWrapper` / `SectionItem` pattern:

- `SectionWrapper` = `motion.section` with `whileInView`, stagger container
- `SectionItem` = `motion.div` child that fades up (`opacity: 0, y: 32` → visible)
- `viewport={{ once: true, amount: 0.1 }}`
- Easing: `[0.22, 1, 0.36, 1]` (custom spring-like ease)

Never add raw `motion` calls to Server Components — push all animation logic to `"use client"` leaf components ("client islands").

---

## Architecture Principles

### Server vs Client Components

- **Every `app/**/page.tsx`is strictly a Server Component — no exceptions, no`"use client"` ever on a page file\*\*
- Data fetching (DB calls) happens inside `page.tsx` and results are passed down as props to client islands
- All interactivity, state, and event handlers live in leaf `"use client"` island components under `components/`
- Admin `page.tsx` files follow the same rule — Server Components that fetch data and pass it to client islands (forms, tabs, tables) in `components/admin/`
- The `"use client"` boundary sits at the smallest possible component, never at page level
- Framer Motion and all animation logic stays in client islands only

### File Structure

```
app/
  (public)/               ← public portfolio routes
    page.tsx              ← homepage (Server Component)
    robots.ts
    sitemap.ts
  admin/
    page.tsx              ← /admin login page
    dashboard/
      page.tsx            ← admin layout + tab navigation (protected)
      projects/page.tsx
      wins/page.tsx
      resume/page.tsx
  api/
    auth/[...nextauth]/route.ts
  globals.css
  layout.tsx

components/
  navigation/             ← navbar.tsx, mobile-menu.tsx
  hero/                   ← hero-section.tsx, hero-actions.tsx, particle-network.tsx
  about/                  ← about-section.tsx
  projects/               ← project-grid.tsx, project-card.tsx, project-carousel.tsx
  wins/                   ← wins-section.tsx, win-card.tsx
  contact/                ← footer.tsx
  admin/                  ← admin-specific UI components
  shared/                 ← section-wrapper.tsx, page-transition.tsx, back-to-top.tsx

lib/
  auth.ts                 ← NextAuth config (Credentials only)
  db/
    mongo.ts              ← Mongoose connection
    models/
      User.ts             ← admin user (email + hashed password)
      Project.ts
      Win.ts
      Resume.ts
  r2.ts                   ← Cloudflare R2 S3 client + upload/delete helpers
  validate.ts             ← Zod schemas
  sanitize.ts             ← XSS escaping helpers

actions/
  auth.ts                 ← loginAction, logoutAction
  projects.ts             ← CRUD for projects
  wins.ts                 ← CRUD for wins
  resume.ts               ← upload/activate/delete resume

proxy.ts                  ← Next.js middleware file (named proxy.ts, NOT middleware.ts)
types/
  index.ts                ← shared TypeScript types
  next-auth.d.ts          ← NextAuth session type extensions
```

### Single Source of Truth

- All content (projects, wins, resume URL) served from **MongoDB** — no more hardcoded data in component files
- `lib/projects.ts` and hardcoded wins in `about-section.tsx` are **deprecated** once DB is live
- Skills section remains hardcoded in `about-section.tsx` — not dynamic (skills don't change often)

---

## MongoDB Collections

### `projects`

```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  bullets: string[],
  tags: string[],
  images: string[],       // R2 public URLs for carousel
  liveUrl?: string,
  githubUrl?: string,
  badge?: string,         // e.g. "🏆 1st Place — Hackfest × IBA 2026"
  featured: boolean,
  order: number,          // controls display order
  createdAt: Date,
}
```

### `wins`

```typescript
{
  _id: ObjectId,
  title: string,          // e.g. "Hackfest × Datathon 2026"
  event: string,          // e.g. "IBA Karachi"
  place: string,          // e.g. "1st Place"
  score?: string,         // e.g. "88/100"
  date: Date,
  description?: string,
  stack?: string[],
}
```

### `resume`

```typescript
{
  _id: ObjectId,
  label: string,          // e.g. "Full-Stack Engineer CV — May 2026"
  fileUrl: string,        // Cloudflare R2 public URL
  isActive: boolean,      // only one active at a time
  uploadedAt: Date,
}
```

### `users` (admin only)

```typescript
{
  _id: ObjectId,
  email: string,
  password: string,       // bcrypt hash, cost factor 12
  role: "admin",
}
```

> Seed via one-time `scripts/seed-admin.ts`. No public registration ever.

---

## Auth

- **NextAuth v5**, JWT strategy, Credentials provider only
- No Google OAuth, no email/OTP flows, no public registration
- Single admin user seeded directly in MongoDB
- `proxy.ts` middleware protects all `/admin/dashboard/*` routes
- Unauthenticated requests to protected routes → redirect to `/admin`
- Authenticated users visiting `/admin` login page → redirect to `/admin/dashboard`

### Session type extension (`types/next-auth.d.ts`)

```typescript
declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; role: string };
  }
}
```

---

## Cloudflare R2

- Bucket accessed via AWS S3-compatible API (`@aws-sdk/client-s3`)
- Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- Region: `"auto"`
- R2 client lives in `lib/r2.ts`
- All uploads happen server-side (Server Actions) — never expose credentials to the client
- Public URLs served from Cloudflare R2's public domain (set in env)

### Upload pattern

```
Client file input → Server Action → PutObjectCommand (R2) → URL saved to MongoDB
```

### Delete pattern

```
Admin delete → Server Action → DeleteObjectCommand (R2) → MongoDB document deleted
```

---

## Environment Variables

```bash
# NextAuth
AUTH_SECRET=                          # openssl rand -base64 32

# MongoDB
MONGODB_URI=                          # MongoDB Atlas connection string

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=            # e.g. https://pub-xxxx.r2.dev

# App
NEXT_PUBLIC_APP_URL=https://talhaahmad.me
```

---

## Public Portfolio Sections (in order)

1. **Navbar** — fixed, logo, nav links, CV download button, social links
2. **Hero** — avatar, name, role, CTAs (Hire Me / Download CV / GitHub), particle network background
3. **About** — bio, education, skills grid, certifications
4. **Wins** — dynamic from MongoDB, dedicated section for hackathon wins and achievements
5. **Projects** — dynamic from MongoDB, image carousel per project card
6. **Footer/Contact** — contact CTA, social links

### CV Download

The "Download CV" button (navbar, mobile menu, hero) must always fetch the **active** resume URL from MongoDB, not a hardcoded `/public/` path.

---

## Admin Panel (`/admin/dashboard`)

Three management sections accessible via tabs:

### Projects tab

- List all projects (ordered by `order` field)
- Add new project (title, description, bullets, tags, live/github URLs, badge, image uploads)
- Edit existing project
- Delete project (also deletes images from R2)
- Drag-to-reorder (updates `order` field)

### Wins tab

- List all wins (newest first)
- Add new win (title, event, place, score, date, description, stack)
- Delete win

### Resume tab

- List uploaded resumes, highlight active one
- Upload new PDF → goes to R2, URL saved to MongoDB
- Set any uploaded resume as active (deactivates others)
- Delete old resumes (removes from R2 + MongoDB)

### Admin UI style

- Matches portfolio color tokens (`black`, `oxfordBlue`, `orangeWeb`, `platinum`, `white`)
- Clean, functional — no external UI library (raw Tailwind only)
- No Framer Motion animations in admin — keep it fast and simple

---

## Image Carousel (Projects)

- Library: `embla-carousel-react`
- Per-project, shows `images[]` array from MongoDB
- Falls back gracefully if no images (shows project card without carousel)
- Navigation: prev/next arrow buttons + dot indicators
- Autoplay optional (off by default)

---

## Key Conventions

### TypeScript

- Strict mode on — no `any` types, ever
- All Mongoose models typed with an interface + `Document` extension
- Server Actions return `{ success: boolean; error?: string; data?: T }`

### Server Actions

- All mutations (create/update/delete) are Server Actions in `actions/`
- All actions validate input with Zod before touching the DB
- All actions sanitize string inputs via `lib/sanitize.ts` before DB writes
- Auth check at the top of every admin action: `const session = await auth(); if (!session) throw new Error("Unauthorized")`

### Imports

- Path alias `@/` maps to project root (configured in `tsconfig.json`)
- Always use `@/` imports, never relative `../../` chains

### Styling

- Tailwind v4 utility classes only
- No inline styles
- No CSS Modules
- No external UI libraries (shadcn, radix, etc.) — build raw with Tailwind

### API Routes

- Only `app/api/auth/[...nextauth]/route.ts` exists — NextAuth handler
- Everything else is Server Actions, not API routes

---

## What NOT to Do

- Do not add Supabase — MongoDB Atlas is the only database
- Do not add Clerk or any third-party auth — NextAuth v5 Credentials only
- Do not use Upstash Redis or rate limiting — single admin user, not needed
- Do not add Resend or any email service — no email flows needed
- Do not add a public registration or signup page
- Do not use raw hex colors — only Tailwind token classes
- Do not add gradients — flat color design only
- Do not use `"use client"` on page-level Server Components
- Do not store secrets in client-side code or expose R2 credentials to the browser
- Do not create API routes for content — use Server Actions

---

## Current Status

**Completed (existing codebase):**

- Full public portfolio: Hero (particle network), About (skills, certs, achievement card), Projects (static from `lib/projects.ts`), Footer
- SEO: metadata, JSON-LD, OG image, sitemap, robots
- Responsive design + mobile menu
- Framer Motion scroll reveals throughout

**To build:**

1. MongoDB connection + all 4 models
2. NextAuth v5 Credentials auth + admin seed script
3. `proxy.ts` middleware for route protection
4. Cloudflare R2 client + upload/delete helpers
5. Server Actions: projects, wins, resume, auth
6. Admin UI: login page + dashboard (projects/wins/resume tabs)
7. Update public portfolio to fetch projects + wins from MongoDB
8. Dynamic CV download button (fetches active resume URL)
9. Image carousel on project cards (`embla-carousel-react`)
10. Update `metadataBase`, sitemap, robots to `talhaahmad.me`
