<div align="center">
  <img src="public/logo.png" alt="Talha Ahmad Portfolio" height="68" />
  <br /><br />
  <p><strong>Full-Stack AI Engineer Portfolio + Admin CMS</strong></p>
  <p>Dynamic content, secure admin workflows, and production-ready architecture.</p>
  <br />

  ![Live](https://img.shields.io/badge/Live-talhaahmad.me-fca311?style=for-the-badge&logo=vercel&logoColor=000000)
  ![Next.js](https://img.shields.io/badge/Next.js-16-fca311?style=for-the-badge&logo=nextdotjs&logoColor=000000)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Strict-fca311?style=for-the-badge&logo=typescript&logoColor=000000)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-fca311?style=for-the-badge&logo=mongodb&logoColor=000000)
</div>

---

## What Is This Project?

This repository powers Talha Ahmad's personal website, but it is more than a static portfolio.

It combines:

1. A public-facing portfolio built with modern frontend patterns and strong SEO.
2. A private admin dashboard where all key content can be edited without changing code.
3. A backend layer for authentication, data storage, file uploads, validation, and secure mutations.

In short: this is a full-stack portfolio platform designed to be maintainable, scalable, and production-ready.

---

## Live Links

- Domain: https://talhaahmad.me
- Repository: https://github.com/Talhaahmad9/portfolio
- Deployment: Vercel

---

## Problem It Solves

Most portfolio sites become outdated because content updates require direct code edits and redeploys.

This project solves that by introducing a secure CMS-like admin experience where Talha can:

1. Update Hero and About content.
2. Add, edit, reorder, and delete projects.
3. Manage hall-of-fame wins.
4. Upload and switch active resumes.
5. Upload certificate images and share them through dedicated public certificate pages.

Everything on the public site is sourced dynamically from MongoDB, so content changes are fast and code-free.

---

## How It Works

### Public side

| Area | What it does |
|---|---|
| Navbar + Hero | Identity, CTA actions, dynamic active CV link |
| About | Bio, auto-playing achievements slideshow, skills, tappable certificate cards, certifications (from SiteConfig) |
| Wins | Dynamic records from MongoDB |
| Projects | Dynamic cards and image carousel from MongoDB + R2 |
| Footer | Contact endpoints and profile links |
| Certificate pages | Shareable direct-link certificate detail pages backed by opaque IDs |

### Admin side

| Route | Purpose |
|---|---|
| /admin | Secure login for admin |
| /admin/dashboard/content | Edit Hero and About content, including achievement slide ordering and certificate image uploads |
| /admin/dashboard/projects | Full project CRUD and ordering |
| /admin/dashboard/wins | Add/remove wins |
| /admin/dashboard/resume | Upload, activate, and delete resumes |

---

## Core Features

| Feature | Detail |
|---|---|
| Dynamic content | Public sections powered by MongoDB (no hardcoded portfolio records) |
| Secure admin auth | NextAuth v5 Credentials, protected dashboard routes |
| Project media pipeline | Multi-image upload and deletion using Cloudflare R2 |
| Resume management | Active resume switching reflected instantly in public CTAs |
| Certificate media pipeline | Admin-managed certificate image uploads with preview, replacement, cleanup, and stable public share pages |
| Input integrity | Zod validation + sanitization before DB writes |
| SEO foundation | Metadata API, JSON-LD Person schema, Open Graph, sitemap, robots |
| Animation system | Shared SectionWrapper and SectionItem reveal pattern |
| Achievement storytelling | About section supports multiple achievements with slideshow controls and admin-managed ordering |
| Ambient interaction | Cursor glow now supports desktop pointer movement and active mobile touch interaction |

---

## Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-14213d?style=flat-square&logo=nextdotjs&logoColor=ffffff)
![TypeScript](https://img.shields.io/badge/TypeScript_Strict-14213d?style=flat-square&logo=typescript&logoColor=ffffff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-14213d?style=flat-square&logo=tailwindcss&logoColor=ffffff)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-14213d?style=flat-square&logo=mongodb&logoColor=ffffff)
![NextAuth](https://img.shields.io/badge/NextAuth_v5-14213d?style=flat-square&logo=nextdotjs&logoColor=ffffff)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-14213d?style=flat-square&logo=cloudflare&logoColor=ffffff)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-14213d?style=flat-square&logo=framer&logoColor=ffffff)
![Embla Carousel](https://img.shields.io/badge/Embla_Carousel-14213d?style=flat-square&logoColor=ffffff)
![Vercel](https://img.shields.io/badge/Vercel-14213d?style=flat-square&logo=vercel&logoColor=ffffff)

</div>

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| Animations | Framer Motion 12 |
| Sliders | Embla Carousel + Autoplay |
| Database | MongoDB Atlas + Mongoose |
| Authentication | NextAuth v5 (Credentials provider only) |
| Storage | Cloudflare R2 via AWS S3-compatible SDK |
| Validation | Zod |
| Hosting | Vercel |

---

## Design System (Project Colors)

The UI uses exactly these five color tokens:

| Token | Hex | Usage |
|---|---|---|
| black | `#000000` | Main canvas/background |
| oxfordBlue | `#14213d` | Surface layers and structure |
| orangeWeb | `#fca311` | Accent, CTA, key interaction states |
| platinum | `#e5e5e5` | Body/secondary copy |
| white | `#ffffff` | Primary text and headings |

Rules:

1. Use token classes, not arbitrary palette values.
2. Orange stays the only accent.
3. No gradients in design language.

---

## Architecture and Rendering Model

1. Every `app/**/page.tsx` remains a Server Component.
2. Interactivity and animation live in small client islands.
3. Server Actions handle all data mutations.
4. All mutable admin operations require authenticated session.

### High-level structure

```text
portfolio/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── certificates/
│   │   └── [publicId]/page.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── admin/
│   │   ├── page.tsx
│   │   └── dashboard/
│   │       ├── content/page.tsx
│   │       ├── projects/page.tsx
│   │       ├── wins/page.tsx
│   │       └── resume/page.tsx
│   └── api/auth/[...nextauth]/route.ts
├── actions/
│   ├── auth.ts
│   ├── config.ts
│   ├── projects.ts
│   ├── wins.ts
│   └── resume.ts
├── components/
│   ├── admin/
│   ├── hero/
│   ├── about/
│   ├── projects/
│   ├── wins/
│   ├── navigation/
│   ├── contact/
│   └── shared/
├── lib/
│   ├── auth.ts
│   ├── r2.ts
│   ├── validate.ts
│   ├── sanitize.ts
│   └── db/models/
├── scripts/
│   ├── seed-admin.ts
│   └── normalize-project-badges.ts
└── types/
```

---

## Database Model

Collections used:

1. users
2. projects
3. wins
4. resume
5. siteconfigs

### Notable behavior

1. `projects` are sorted by `order` for stable display.
2. `wins` are sorted by latest date first.
3. `resume` keeps exactly one active CV at a time.
4. `siteconfigs` acts as a singleton content source for Hero and About sections.
5. `about.achievements` is an ordered array, and that order drives the public slideshow sequence.
6. `about.certifications` can now carry opaque public IDs and R2-backed image URLs for shareable certificate pages.

---

## Upload and Delivery Pipeline

For project images, certificate images, and resume PDFs:

1. User selects file in admin UI.
2. Client submits via form data to Server Action.
3. Server Action uploads to Cloudflare R2.
4. Public file URL is saved to MongoDB.
5. Relevant paths are revalidated.

On delete:

1. Object is removed from R2.
2. Database reference is removed.

Certificate links are routed through app pages rather than sharing raw storage URLs as the primary user entry point.

---

## Environment Variables

Create `.env.local` in root:

```bash
# NextAuth
AUTH_SECRET=

# MongoDB
MONGODB_URI=

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=

# App
NEXT_PUBLIC_APP_URL=https://talhaahmad.me

# Optional seed overrides
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## Local Development

```bash
# Install packages
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000

### Seed admin user

```bash
npm run seed
```

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production app |
| `npm run start` | Start production server |
| `npm run lint` | Run lint checks |
| `npm run seed` | Seed default admin user |
| `npm run normalize:project-badges` | Normalize existing badge labels |

---

## Security Notes

1. Dashboard routes are protected through `proxy.ts`.
2. All mutating actions verify session first.
3. Zod validation blocks malformed payloads.
4. Plain text content is normalized before persistence and rendered through React text nodes instead of storing HTML entities.
5. Storage credentials are server-only.
6. Certificate detail pages use opaque `publicId` values and are intended for direct-link sharing rather than search discovery.

---

## Deployment

1. Push to GitHub.
2. Import repository in Vercel.
3. Add environment variables.
4. Deploy and verify admin + upload flows.

Recommended checks after deploy:

1. Public pages load with dynamic content.
2. Admin login redirects and protection rules work.
3. Project image upload/delete works.
4. Resume activate/deactivate flow works across Hero/Nav/Mobile Menu.
5. Certificate image upload and replacement works from the content dashboard.
6. Shared certificate URLs resolve correctly and remain excluded from indexing.

---

## Contact

- Email: hi.talhaahmad@gmail.com
- LinkedIn: https://linkedin.com/in/talha-ahmad9
- GitHub: https://github.com/Talhaahmad9

---

<div align="center">
  Built and maintained by <strong>Talha Ahmad</strong>.
</div>
