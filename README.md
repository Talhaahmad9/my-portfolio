<div align="center">

# Talha Ahmad — Portfolio

**AI Engineer & Next.js Developer**

[![Live](https://img.shields.io/badge/Live-talhaahmad.vercel.app-fca311?style=for-the-badge&logo=vercel&logoColor=black)](https://talhaahmad.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion)

</div>

---

## Overview

Personal portfolio for **Talha Ahmad** — Full-Stack AI Engineer and Computer Science student at IoBM, Karachi. Built with a focus on performance, SEO, mobile-first design, and maximum animation polish.

Winner of **Hackfest × Datathon 2026** hosted by IBA Karachi (1st Place, 88/100) — building a multi-agent GenAI framework with LangGraph and Google Gemini 2.0 Flash.

---

## ✨ Features

| Feature | Detail |
|---|---|
| ⚡ **Performance** | Statically prerendered, zero client JS on the root page |
| 🎨 **Design System** | Tailwind v4 `@theme` — 5 solid color tokens, no gradients |
| 🤖 **Animations** | Framer Motion scroll reveals, staggered fades, page entrance, hover interactions |
| 📱 **Mobile-First** | Responsive layout + animated hamburger menu with slide-down drawer |
| 🔍 **SEO** | Next.js Metadata API, JSON-LD Schema.org/Person, Open Graph image, Twitter card |
| 🗺️ **Indexing** | Auto-generated `/sitemap.xml` and `/robots.txt` via App Router |
| ♿ **Accessibility** | Semantic HTML, `aria` labels, high-contrast focus rings |
| 📄 **CV Download** | One-click PDF download from hero, navbar, and mobile menu |

---

## 🏗️ Architecture

```
portfolio/
├── app/
│   ├── globals.css          # Tailwind v4 @theme (5 color tokens only)
│   ├── layout.tsx           # SEO metadata, JSON-LD, fonts, PageTransition
│   ├── page.tsx             # Server Component root — no "use client"
│   ├── robots.ts            # Auto-generates /robots.txt
│   └── sitemap.ts           # Auto-generates /sitemap.xml
│
├── components/
│   ├── navigation/
│   │   ├── navbar.tsx       # Fixed header, logo, CV button ("use client")
│   │   └── mobile-menu.tsx  # Hamburger + animated drawer ("use client")
│   ├── hero/
│   │   ├── hero-section.tsx # Avatar, name, role badge (Server shell)
│   │   └── hero-actions.tsx # CTA buttons with whileHover ("use client")
│   ├── about/
│   │   └── about-section.tsx # Bio, skills grid, achievement card, certs
│   ├── projects/
│   │   └── project-grid.tsx  # Real project cards from lib/projects.ts
│   ├── contact/
│   │   └── footer.tsx        # Contact CTA + social links
│   └── shared/
│       ├── section-wrapper.tsx  # Framer Motion whileInView + stagger ("use client")
│       ├── page-transition.tsx  # Entrance fade wrapper ("use client")
│       └── back-to-top.tsx      # Fixed scroll-to-top button ("use client")
│
├── lib/
│   ├── config.ts            # GITHUB_URL, LINKEDIN_URL, EMAIL
│   └── projects.ts          # Typed Project[] — single source of truth
│
├── public/
│   ├── avatar.png           # Hero profile photo
│   ├── logo.png             # Navbar logo
│   ├── og-image.JPG         # Open Graph / Twitter card image
│   └── Talha_Ahmad_CV.pdf   # Downloadable resume
│
└── hooks/                   # Custom hooks (useActiveSection — upcoming)
```

### Key Design Decisions

- **Server Component root** — `app/page.tsx` has zero `"use client"`. All interactive logic is pushed to leaf components ("client islands"), keeping the page statically renderable.
- **Single config source** — All social URLs and project data live in `lib/`. Update once, reflects everywhere.
- **`@theme` only** — `globals.css` contains nothing but the Tailwind import and `@theme` block. All colours are consumed as standard Tailwind utility classes (`bg-black`, `text-orangeWeb`, etc.).

---

## 🎨 Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `black` | `#000000` | Primary canvas, body background |
| `oxfordBlue` | `#14213d` | Cards, section dividers, nav border |
| `orangeWeb` | `#fca311` | Accents, CTAs, links, hover states |
| `platinum` | `#e5e5e5` | Body text, secondary content |
| `white` | `#ffffff` | Headings, high-emphasis text |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Talhaahmad9/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion 12 |
| **Fonts** | Geist Sans + Geist Mono (next/font) |
| **Deployment** | Vercel |

---

## 📦 Deployment

This project is optimised for **Vercel** deployment:

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no configuration needed
4. Done — live in under 2 minutes

> **Note:** Update `metadataBase`, `openGraph.url`, and `sitemap.ts` with your final production URL before deploying.

---

## 📬 Contact

| | |
|---|---|
| **Email** | [hi.talhaahmad@gmail.com](mailto:hi.talhaahmad@gmail.com) |
| **LinkedIn** | [linkedin.com/in/talha-ahmad9](https://linkedin.com/in/talha-ahmad9) |
| **GitHub** | [github.com/Talhaahmad9](https://github.com/Talhaahmad9) |

---

<div align="center">

Built by **Talha Ahmad** · © 2026

</div>
