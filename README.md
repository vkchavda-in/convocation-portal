# Dr. Mahendra Sharma � Website & CMS

A full-stack, self-hosted Content Management System (CMS) and public-facing website built for Dr. Mahendra Sharma. It is a unified Next.js application that serves both a dynamic public website and a secure, role-based admin portal for managing all content.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture & How It Works](#architecture--how-it-works)
4. [Getting Started (Local Development)](#getting-started-local-development)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Authentication & Security](#authentication--security)
8. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
9. [Admin Portal Pages](#admin-portal-pages)
10. [API Reference](#api-reference)
11. [CMS Module System](#cms-module-system)
12. [Public Website](#public-website)
13. [Deployment](#deployment)
14. [Database Backup & Restore](#database-backup--restore)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL |
| **ORM** | Prisma v6 |
| **Authentication** | JWT via `jose` library (HttpOnly cookies) |
| **Password Hashing** | bcryptjs |
| **Edge Security** | Next.js Proxy (`src/proxy.ts`) |
| **Toast Notifications** | Sonner |
| **Icons** | Lucide React |
| **File Storage** | Local filesystem (`/public/uploads/`) |

---

## Project Structure

```
sharma-website/
+-- prisma/
�   +-- schema.prisma          # Database schema (Page, Setting, Media, User)
�
+-- public/
�   +-- uploads/               # Uploaded media files (images, PDFs, etc.)
�
+-- src/
    +-- proxy.ts               # Edge security (Auth + RBAC for all routes)
    �
    +-- app/
    �   +-- layout.tsx         # Root HTML layout (fonts, global CSS)
    �   �
    �   +-- (website)/         # PUBLIC WEBSITE route group
    �   �   +-- layout.tsx     # Navbar + Footer + Maintenance check
    �   �   +-- page.tsx       # Home page (slug: "home")
    �   �   +-- [slug]/        # Dynamic CMS pages
    �   �       +-- page.tsx
    �   �
    �   +-- admin/             # ADMIN PORTAL route group
    �   �   +-- layout.tsx     # Admin root layout (Toaster)
    �   �   +-- login/         # Login page (/admin/login)
    �   �   +-- (dashboard)/   # Protected dashboard routes
    �   �       +-- layout.tsx # Sidebar + main content layout
    �   �       +-- page.tsx   # Dashboard home (role-aware stats)
    �   �       +-- pages/     # Page manager
    �   �       +-- media/     # Media library
    �   �       +-- global/    # Header & footer editor
    �   �       +-- settings/  # Site settings
    �   �       +-- theme/     # Appearance / color theme
    �   �       +-- users/     # User management (Admin+ only)
    �   �
    �   +-- api/               # REST API routes
    �   �   +-- auth/
    �   �   �   +-- login/     # POST /api/auth/login
    �   �   �   +-- logout/    # POST /api/auth/logout
    �   �   �   +-- me/        # GET /api/auth/me (role info)
    �   �   +-- pages/         # CRUD for pages
    �   �   +-- media/         # Upload + manage media
    �   �   +-- settings/      # Read/write site settings
    �   �   +-- global/        # Read/write header & footer
    �   �   +-- users/         # CRUD for admin users
    �   �
    �   +-- components/        # Shared UI (Navbar, Footer, ContactCTA)
    �
    +-- components/
    �   +-- admin/             # Admin-only components
    �   �   +-- AdminSidebar.tsx
    �   �   +-- BlockEditor.tsx
    �   �   +-- PageEditClient.tsx
    �   �   +-- MediaPicker.tsx
    �   �   +-- block-editors/ # Per-block editor panels
    �   +-- cms/               # Public-facing CMS rendering
    �   �   +-- BlockRenderer.tsx
    �   �   +-- DynamicPage.tsx
    �   +-- modules/           # Visual block components (9 types)
    �   +-- shared/            # Reusable shared components
    �
    +-- lib/
    �   +-- prisma.ts          # Prisma singleton client
    �   +-- cms/
    �       +-- section-registry.ts  # Maps block type to component
    �
    +-- styles/
    �   +-- theme.css          # CSS custom properties (colors, fonts)
    �   +-- globals.css        # Base global styles
    �   +-- tailwind.css       # Tailwind entry point
    �   +-- fonts.css          # Google Font imports
    �
    +-- types/
        +-- cms.ts             # TypeScript types for CMS blocks
```

---

## Architecture & How It Works

This application operates as a full-stack, modular Next.js CMS with secure Admin and Public rendering layers.

### 1. Request Flow & Security (Middleware)
- All requests targeting `/admin` and `/api` endpoints pass through the proxy middleware ([src/proxy.ts](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/proxy.ts)).
- The proxy validates the `admin-token` HTTP-only cookie using the `jose` JWT library.
- If authorized, the user's role (`SUPER_ADMIN`, `ADMIN`, or `EDITOR`) is verified against the endpoint permissions to enforce Role-Based Access Control (RBAC).

### 2. Public Frontend Rendering (The CMS Engine)
- The public-facing site utilizes server-side dynamic rendering (`export const revalidate = 0`).
- The routes match either `/` ([src/app/(website)/page.tsx](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/app/(website)/page.tsx)) or `/[slug]` ([src/app/(website)/[slug]/page.tsx](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/app/(website)/%5Bslug%5D/page.tsx)) and load the page record from PostgreSQL.
- The `sections` field (a JSON array of blocks) is fetched and passed to the [BlockRenderer](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/components/cms/BlockRenderer.tsx) component.
- The `BlockRenderer` checks the type of each block (e.g. `hero`, `metrics`, `timeline`) against the **Section Registry** ([src/lib/cms/section-registry.ts](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/lib/cms/section-registry.ts)).
- The corresponding visual component from `src/components/modules/` is dynamically rendered on-screen with the data attributes passed as props.

### 3. Backend API Layer
- Route Handlers under `src/app/api/` manage operations via the Prisma Client singleton ([src/lib/prisma.ts](file:///c:/Active%20Projects/SharmaSir_Website_PNPM/src/lib/prisma.ts)).
- The REST routes handle authentication session lifecycle, media library file uploads to the local filesystem (`/public/uploads/`), page edits, user configurations, and global header/footer states.

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally
- pnpm

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Set up your environment file
cp .env .env.local
# Edit .env.local with your database URL and credentials

# 3. Push the database schema
pnpm prisma:push

# 4. Start the development server
pnpm dev
```

The app will be available at http://localhost:3000.

**First Login:** Go to /admin/login and use the credentials from your .env.local file.
On your very first login, the system automatically creates your SUPER_ADMIN account in the database.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/sharma_website` |
| `JWT_SECRET` | Secret for signing JWT tokens (use a long random string) | `my-super-secret-key-32chars+` |
| `ADMIN_USERNAME` | Username for the initial Super Admin account | `admin` |
| `ADMIN_PASSWORD` | Password for the initial Super Admin account | `strongpassword123` |

> After your first login (which seeds your admin account), ADMIN_USERNAME and ADMIN_PASSWORD
> are no longer used for authentication. They only serve as a recovery mechanism.

---

## Database Schema

### Models

#### Page
| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `slug` | String (unique) | URL path (e.g. "about", "home") |
| `title` | String | Display title |
| `metaTitle` | String? | SEO title override |
| `metaDescription` | String? | SEO description |
| `sections` | Json | Array of CMS block objects |
| `isPublished` | Boolean | If false, page returns 404 |
| `order` | Int | Display order in the Pages list |
| `authorId` | String? | FK to User who created the page |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

#### Setting (Key-Value Store)
| Key | Description |
|---|---|
| `app_settings` | JSON: siteName, maintenanceMode, contactEmail, SEO defaults |
| `global_header` | JSON: site name, logo, nav links, CTA |
| `global_footer` | JSON: tagline, copyright, columns, social links |
| `theme_settings` | JSON: color palette, font choices |

#### Media
| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `filename` | String | Stored filename on disk |
| `originalName` | String | Original filename from upload |
| `mimeType` | String | e.g. "image/jpeg" |
| `size` | Int | File size in bytes |
| `url` | String | Public URL path (/uploads/...) |
| `alt` | String | Alt text for accessibility |
| `uploaderId` | String? | FK to User who uploaded it |

#### User
| Field | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `username` | String (unique) | Login username |
| `passwordHash` | String | bcrypt hashed password |
| `name` | String? | Display name |
| `role` | Role enum | SUPER_ADMIN, ADMIN, or EDITOR |
| `isActive` | Boolean | Inactive users cannot log in |

---

## Authentication & Security

1. **Login** � Server verifies bcrypt password hash, signs a JWT `{ userId, username, role }`.
2. **Cookie** � JWT stored in a secure, `HttpOnly` cookie named `admin-token` (expires in 8h, JS cannot read it).
3. **Edge Proxy** (`src/proxy.ts`) � Intercepts every request to `/admin/*` and `/api/*`, verifies the JWT. Invalid/missing token = instant redirect or 401.
4. **Header Injection** � On success, injects `x-user-role` and `x-user-id` headers so API handlers can enforce permissions without re-verifying the JWT.
5. **Logout** � Deletes the `admin-token` cookie.

---

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Permissions |
|---|---|
| **SUPER_ADMIN** | Full unrestricted access. Can delete any user. |
| **ADMIN** | Manage all content, users, settings, and theme. Cannot delete SUPER_ADMIN. |
| **EDITOR** | Pages and Media only. No access to Settings, Appearance, or Users. |

### Proxy Path Rules
```
SUPER_ADMIN  ? All paths
ADMIN        ? /admin/*, /api/*
EDITOR       ? /admin, /admin/pages, /admin/media, /api/pages, /api/media, /api/auth
```

If an EDITOR tries to access /admin/settings, they are redirected to /admin.
If they call /api/settings directly, they get 403 Forbidden.

---

## Admin Portal Pages

| Route | Description |
|---|---|
| `/admin/login` | Login form |
| `/admin` | Dashboard: role-aware stats + recent pages |
| `/admin/pages` | Page table: search, publish toggle, reorder, duplicate, delete |
| `/admin/pages/new` | Create a new page |
| `/admin/pages/[slug]/edit` | Visual block editor |
| `/admin/media` | Upload, view, delete media. Copy URL. |
| `/admin/global` | Edit site header (nav, logo, CTA) and footer |
| `/admin/settings` | Site name, SEO, maintenance mode, session timeout |
| `/admin/theme` | Color palette and typography |
| `/admin/users` | Create, edit, deactivate, delete users (Admin+ only) |

---

## API Reference

All routes require the `admin-token` cookie (except login/logout).

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | No | Log in, receive JWT cookie |
| POST | /api/auth/logout | No | Clear JWT cookie |
| GET | /api/auth/me | Yes | Returns { role, userId } |

### Pages
| Method | Path | Description |
|---|---|---|
| GET | /api/pages | List all pages |
| POST | /api/pages | Create a page |
| GET | /api/pages/[slug] | Get full page data |
| PUT | /api/pages/[slug] | Update page |
| DELETE | /api/pages/[slug] | Delete page |
| PUT | /api/pages/reorder | Update display order |

### Media
| Method | Path | Description |
|---|---|---|
| GET | /api/media | List all media |
| POST | /api/media | Upload file (multipart/form-data) |
| PUT | /api/media/[id] | Update alt text |
| DELETE | /api/media/[id] | Delete file from DB and disk |

### Settings
| Method | Path | Description |
|---|---|---|
| GET | /api/settings | Get all settings |
| PUT | /api/settings | Update settings |

### Global
| Method | Path | Description |
|---|---|---|
| GET | /api/global | Get header and footer data |
| PUT | /api/global | Save header and/or footer |

### Users (Admin+ only)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/users | Admin+ | List all users |
| POST | /api/users | Admin+ | Create user |
| PUT | /api/users/[id] | Admin+ | Update user |
| DELETE | /api/users/[id] | SUPER_ADMIN | Delete user |

---

## CMS Module System

Pages are made of blocks stored as JSON in Page.sections.

### Block Structure
```json
{
  "id": "unique-block-id",
  "type": "hero",
  "data": { }
}
```

### Available Block Types

| Type | Description |
|---|---|
| `hero` | Full-width banner: title, subtitle, CTA buttons, background |
| `narrative` | Text + image side-by-side |
| `card_grid` | Grid of icon + title + description cards |
| `timeline` | Chronological list of events |
| `metrics` | Statistics/numbers row |
| `gallery` | Masonry photo gallery |
| `media` | Full-width video or image embed |
| `contact` | Contact form |
| `quote` | Blockquote with attribution |

### Adding a New Block Type
1. Create `src/components/modules/MyNewModule.tsx` (public render).
2. Create `src/components/admin/block-editors/MyNewEditor.tsx` (admin edit panel).
3. Register in `src/lib/cms/section-registry.ts`.
4. Register editor in `src/components/admin/BlockEditor.tsx`.

---

## Public Website

- `/` renders the page with `slug = "home"`
- `/[slug]` renders any other published page
- Unpublished pages or unknown slugs return **404**
- **Maintenance Mode**: When enabled in Settings, all public routes show a maintenance screen. The admin portal remains accessible.

---

## Deployment

### Requirements
- PostgreSQL database (Supabase, Railway, Neon, or self-hosted)
- Node.js 18+ server (Vercel, Railway, VPS)

### Steps

```bash
# Set production environment variables on your host

# Install dependencies
pnpm install

# Push schema to production database
pnpm prisma:push

# Build the production bundle
pnpm build

# Start the server
pnpm start
```

### pnpm Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm prisma:push` | Sync schema to database |
| `pnpm prisma:generate` | Regenerate Prisma Client |
| `pnpm prisma:studio` | Open Prisma Studio GUI |
| `pnpm seed` | Seed database with mock data from Vite project |

---

## Database Backup & Restore

### Current Backup

| File | Date | Format | Size |
|---|---|---|---|
| `backups/sharma_website_backup_2026-06-05.dump` | 5 June 2026 | PostgreSQL custom (pg_dump -Fc) | ~21 KB |

> **Note:** The `backups/` directory is listed in `.gitignore` and will **not** be committed to version control. Store backups securely (e.g. a private cloud drive or encrypted storage).

### Taking a New Backup

Run the following command from the project root (replace the date in the filename):

```powershell
# Windows PowerShell
$env:PGPASSWORD = "admin123"
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" `
  -U webbuilder_user -h localhost -p 5432 `
  -F c `
  -f ".\backups\sharma_website_backup_$(Get-Date -Format 'yyyy-MM-dd').dump" `
  sharma_website
```

```bash
# Linux / macOS
PGPASSWORD=admin123 pg_dump \
  -U webbuilder_user -h localhost -p 5432 \
  -F c \
  -f "./backups/sharma_website_backup_$(date +%Y-%m-%d).dump" \
  sharma_website
```

### Restoring from a Backup

```powershell
# Windows PowerShell — restore into a fresh (empty) database
$env:PGPASSWORD = "admin123"
& "C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" `
  -U webbuilder_user -h localhost -p 5432 `
  -d sharma_website --clean --if-exists `
  ".\backups\sharma_website_backup_2026-06-05.dump"
```

```bash
# Linux / macOS
PGPASSWORD=admin123 pg_restore \
  -U webbuilder_user -h localhost -p 5432 \
  -d sharma_website --clean --if-exists \
  ./backups/sharma_website_backup_2026-06-05.dump
```

### Full Reset + Re-seed (Development)

If you need to wipe and rebuild the database from scratch:

```bash
# 1. Reset DB and re-apply migrations
pnpm prisma migrate reset --force --skip-seed

# 2. Run initial migration
pnpm prisma migrate dev --name init --skip-seed

# 3. Regenerate Prisma Client
pnpm prisma generate

# 4. Seed with mock data
pnpm seed
```

---

## Developer Notes

- **No global state manager** � The admin uses Next.js server + client components with `fetch`.
- **Prisma Singleton** � `src/lib/prisma.ts` prevents connection pool exhaustion in dev.
- **File Uploads** � Stored in `public/uploads/`. In production, replace with S3 or Cloudinary.
- **CSS Variables** � All theme tokens defined in `src/styles/theme.css`. The Appearance admin page modifies these via the `theme_settings` database key.
