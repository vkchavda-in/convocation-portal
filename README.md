# Ganpat University — Convocation Portal & CMS

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

An enterprise-grade, high-performance web portal and self-hosted Content Management System (CMS) custom-built for **Ganpat University's 19th Convocation Ceremony**. 

The portal serves as the official digital gateway for graduating scholars, patrons, dignitaries, and parents, featuring an interactive ceremony schedule, past convocation chronicles (1st to 19th), live degree and awardee statistics, media archives, and a real-time block-based admin studio.

---

## 🌟 Key Highlights

- **Cinematic Flagship Hero**: Dynamically scaled ceremonial canvas with automatic visual slideshow rotation, glassmorphic info pills, Sanskrit university motto, and student cutout integration.
- **Awardees Statistics Engine**: 6 distinct layout variants (`balanced-split`, `glass-cards`, `editorial-compact`, `monolith-counter`, `split-stat-panels`, `cinematic-timeline`) displaying real 19th batch conferring stats (4,729 awardees, 101 gold medalists, gender ratios, degree levels & faculties).
- **Convocation Chronicles & Dignitaries**: Interactive archive of all 19 convocations (from 2008 to 2026) featuring verified Chief Guests, Guests of Honour, and Special Dignitaries.
- **Visual Block-Based CMS Studio**: Live block editor at `/admin` allowing real-time modification of every section (Hero, Awardees Stats, Guests, Quotations, Media Gallery, Press Coverage, Timelines, etc.).
- **Role-Based Edge Security (RBAC)**: Next.js Edge proxy middleware validating JWTs via HttpOnly cookies with `SUPER_ADMIN`, `ADMIN`, and `EDITOR` permission tiers.
- **Subpage Layout Synchronization**: Single-click propagation of subpage hero styling, headers, and color themes across all portal routes.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 & Lucide Icons |
| **Database** | PostgreSQL |
| **ORM** | Prisma v6 |
| **Authentication** | JWT via `jose` library (Secure HttpOnly cookies) |
| **Password Hashing** | `bcryptjs` |
| **Notifications** | `sonner` (Toast system) |
| **Asset Processing** | `sharp` (High-resolution image optimization & attention detection) |
| **Asset Storage** | Local filesystem (`/public/uploads/`) |

---

## 📁 Project Architecture

```
convocation-portal/
├── prisma/
│   └── schema.prisma              # PostgreSQL schema (Page, Setting, Media, User)
├── public/
│   ├── uploads/                   # Uploaded media assets, portraits & photos
│   └── assets/                    # Brand logos & static vectors
├── src/
│   ├── proxy.ts                   # Edge security & RBAC route protection
│   ├── app/
│   │   ├── layout.tsx             # Root layout with typography and site loader
│   │   ├── (website)/             # Public portal route group
│   │   │   ├── page.tsx           # Home page (slug: "home")
│   │   │   └── [slug]/page.tsx    # Dynamic CMS pages engine
│   │   ├── admin/                 # Admin Studio route group
│   │   │   ├── login/page.tsx     # Admin authentication
│   │   │   └── (dashboard)/       # Dashboard, Page Manager, Media Library, Theme & Settings
│   │   └── api/                   # REST endpoints (auth, pages, media, global, users)
│   ├── components/
│   │   ├── admin/                 # Block editors, MediaPicker, PageEditClient, AdminSidebar
│   │   ├── cms/                   # DynamicPage & BlockRenderer dispatcher
│   │   ├── modules/               # Visual block modules:
│   │   │   ├── HeroModule.tsx             # Cinematic hero & slider variants
│   │   │   ├── AwardeesStatsModule.tsx    # 6-variant academic stats engine
│   │   │   ├── CardGridModule.tsx         # Marquee & grid archives (Guests, Testimonials)
│   │   │   ├── GalleryModule.tsx          # Dual-row marquee photo galleries
│   │   │   ├── QuoteModule.tsx            # Leadership messages & portraits
│   │   │   ├── TimelineModule.tsx         # Milestone chronology
│   │   │   ├── PressModule.tsx            # News & press coverage
│   │   │   ├── MeetingsModule.tsx         # Dignitary interactive log
│   │   │   └── ContactModule.tsx          # Secretariat contact & RSVP
│   │   └── shared/                # SiteLoader, OptimizedImage, FadeIn, Navigation
│   ├── lib/
│   │   ├── prisma.ts              # Prisma singleton client
│   │   ├── auth.ts                # JWT creation & verification utilities
│   │   └── cms/section-registry.tsx # Registry mapping block types to UI components
│   ├── styles/
│   │   ├── globals.css            # Base stylesheet & font variables
│   │   └── theme.css              # Custom CSS variables & color palettes
│   └── types/
│       └── cms.ts                 # Type definitions for all CMS blocks & data
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **pnpm**: v8+ or v9+ (or npm / yarn)
- **PostgreSQL**: 14+ running locally or cloud-hosted (Supabase, Neon, Railway)

### 1. Installation

```bash
# Clone repository
git clone https://github.com/vkchavda-in/convocation-portal.git
cd convocation-portal

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/convocation_db?schema=public"
JWT_SECRET="your-secure-random-32-char-jwt-secret-key"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-strong-password"
```

### 3. Database Migration & Setup

```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public portal and [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Studio.

---

## 🔑 Default Admin Access

On the very first login at `/admin/login`, the system seeds the initial `SUPER_ADMIN` account using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` defined in your `.env`.

Subsequent user management (creating editors, changing roles, password resets) can be managed directly in **Admin Studio → Users**.

---

## 🚢 Production Deployment (Webuzo / VPS / PM2)

### SSH Clone & Build

```bash
# 1. Clone into web directory
git clone git@github.com:vkchavda-in/convocation-portal.git .

# 2. Install dependencies & build
pnpm install
npx prisma generate
npx prisma db push
pnpm build

# 3. Start with PM2
pm2 start npm --name "convocation-portal" -- start
```

### Pulling Future Updates

```bash
git pull origin main
pnpm build
pm2 restart convocation-portal
```

---

## 🛡️ License

Custom-developed for **Ganpat University**. All rights reserved.
