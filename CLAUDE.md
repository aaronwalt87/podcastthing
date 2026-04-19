# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Assistant Guide for PODCAST//TERM

## Project Overview

**PODCAST//TERM** is an AI/tech news terminal with a curated podcast episode archive. It aggregates AI/tech news from RSS feeds and Hacker News into a live telemetry sidebar, while displaying podcast episodes in an editorial magazine layout. Deployed on Vercel, backed by Upstash Redis and Vercel Blob.

**Tech stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Upstash Redis · Vercel Blob

---

## Repository Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage: 2-column layout (episodes + news sidebar)
│   ├── layout.tsx              # Root layout: TopNav + PlayerProvider + AudioPlayerBar
│   ├── globals.css             # Analog Frontier tokens + IBM Plex Mono + animations
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard (client component)
│   │   └── login/page.tsx      # Login page
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts  # POST — verify password, set cookie
│       │   └── logout/route.ts # POST — clear cookie
│       ├── episodes/
│       │   ├── route.ts        # GET all, POST create
│       │   └── [id]/route.ts   # GET, PUT, DELETE single episode
│       ├── news/route.ts       # GET cached news items
│       ├── news/refresh/route.ts # GET (cron) — refresh news cache
│       └── upload/route.ts     # Vercel Blob upload handler
├── components/
│   ├── admin/
│   │   ├── EpisodeForm.tsx     # Add/edit episode form
│   │   ├── EpisodeList.tsx     # Admin episode list with edit/delete
│   │   └── LoginForm.tsx
│   ├── TopNav.tsx              # Fixed top navigation bar (hidden on /admin)
│   ├── AudioPlayerBar.tsx      # Fixed bottom audio player
│   ├── CategoryTabs.tsx        # Category filter chips
│   ├── EpisodeCard.tsx         # 16:9 editorial article card (featured prop)
│   ├── EpisodeGrid.tsx         # Featured-first editorial grid layout
│   └── NewsReadout.tsx         # LIVE_TELEMETRY_ sidebar list (server-populated)
├── context/
│   └── PlayerContext.tsx       # Global audio player state (React Context)
├── lib/
│   ├── auth.ts                 # HMAC-SHA256 session token helpers
│   ├── episodes.ts             # Episode CRUD wrappers (calls redis.ts)
│   ├── news.ts                 # RSS + HN Algolia fetch, Redis cache
│   └── redis.ts                # Upstash Redis client initialisation
├── middleware.ts               # Protects /admin/* — redirects if unauthenticated
└── types/
    ├── episode.ts              # Episode TypeScript interface
    └── news.ts                 # NewsItem interface
```

---

## Development Commands

```bash
npm run dev      # Start local dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test runner is configured. Verify changes manually or with `npm run lint` + `npm run build`.

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values before running locally.

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Plaintext admin password (compared via HMAC) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `CRON_SECRET` | Bearer token for `GET /api/news/refresh` (generate: `openssl rand -hex 32`) |
| `NEWS_TTL_SECONDS` | News cache TTL in seconds (optional, default 7200) |

> **Note:** On Vercel, `BLOB_READ_WRITE_TOKEN` and the Redis tokens are injected automatically when you connect the respective integrations from the Vercel dashboard.

---

## Data Model

### Episode

Defined in `src/types/episode.ts`:

```typescript
interface Episode {
  id: string           // UUID v4
  title: string
  showName: string
  description: string
  audioUrl: string     // Vercel Blob URL or external URL
  audioType: 'upload' | 'url'
  thumbnailUrl?: string
  category?: string
  addedAt: number      // Unix milliseconds
}
```

### Redis Storage Layout

```
episodes_index          → sorted set; score = addedAt (ms), member = episode ID
episodes:{id}           → hash; all Episode fields as string values
```

All Redis operations go through `src/lib/episodes.ts`. Do not call `src/lib/redis.ts` directly from components or API routes — use the helper functions in `episodes.ts`.

---

## API Routes

### Episodes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/episodes` | No | Return all episodes (newest first) |
| POST | `/api/episodes` | No | Create a new episode |
| GET | `/api/episodes/[id]` | No | Fetch a single episode |
| PUT | `/api/episodes/[id]` | No | Update episode metadata |
| DELETE | `/api/episodes/[id]` | No | Delete episode + blob if audioType='upload' |

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Verify `ADMIN_PASSWORD`, set `auth_token` cookie |
| POST | `/api/auth/logout` | Clear `auth_token` cookie |

### Upload

| Method | Path | Description |
|---|---|---|
| POST | `/api/upload` | Generate client upload token and handle `onUploadCompleted` callback |

---

## Authentication

- Session token is an HMAC-SHA256 signature stored in an `httpOnly`, `secure`, `sameSite: lax` cookie named `auth_token`.
- Token expires after 7 days.
- The middleware (`src/middleware.ts`) intercepts all `/admin/*` routes and validates the token; unauthenticated requests redirect to `/admin/login`.
- `ADMIN_PASSWORD` is a single shared secret stored in an env variable — there is no user database.

---

## Audio Playback Architecture

- `PlayerContext` (`src/context/PlayerContext.tsx`) holds the global player state: current episode, playing flag, and control methods (`play`, `pause`, `resume`).
- A single `<audio>` element is rendered inside `PlayerProvider` and referenced via `audioRef` (exposed on the context). `AudioPlayerBar` consumes `audioRef` directly for scrubbing rather than going through context methods.
- `AudioPlayerBar` is rendered in the root layout and is always visible at the bottom of the screen (root layout adds `pb-24`).
- Scrub/seek uses a ref-based approach to avoid triggering React re-renders during drag.

---

## Styling Conventions

- **Tailwind CSS + inline `style` props** — no CSS modules, no styled-components. Custom design tokens are applied via `style={}`, not Tailwind config extensions.
- **The Analog Frontier** palette (see `design.md`):
  - Background: `#131313` (void), surface: `#1c1b1b`, elevated: `#353534`
  - Primary accent: `#FF3B3B` (phosphor red, with `0 0 Npx rgba(255,59,59,X)` glow)
  - Secondary accent: `#67d7e1` (cyan phosphor)
  - Text: `#e5e2e1` (paper white)
- **Fonts** (Google Fonts, loaded in `globals.css`):
  - **Space Grotesk** — all labels, headings, nav; always uppercase + `tracking-widest`
  - **Manrope** — body text, episode titles, descriptions
  - **IBM Plex Mono** — timestamps, tabular metadata; use `.font-mono` class
- **Zero border radius** — every element has `0px` corners, no exceptions.
- `globals.css` provides: CRT scanline overlay (`body::after`), `.font-mono`, `.blink`, `newsFadeIn` keyframe, custom range input and scrollbar styling.
- `EpisodeCard` accepts a `featured?: boolean` prop — featured cards use `text-base` title and `p-4` padding vs `text-sm` / `p-3` for standard.
- `EpisodeGrid` uses a featured-first layout when ≥ 3 episodes (first episode large, next 2 secondary, rest in archive grid).
- `TopNav` uses `usePathname()` to highlight active nav link; returns `null` on `/admin` routes so the admin panel has its own header.

---

## Code Conventions

### Naming

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `EpisodeCard`, `AudioPlayerBar` |
| Component files | PascalCase | `EpisodeCard.tsx` |
| Utility / lib files | lowercase | `auth.ts`, `redis.ts` |
| Functions / variables | camelCase | `handleSubmit`, `currentEpisode` |
| Constants | UPPER_SNAKE_CASE | `COOKIE_NAME`, `INDEX_KEY` |
| Path alias | `@/*` → `./src/*` | `import { Episode } from '@/types/episode'` |

### Component Patterns

- Mark a file `'use client'` only when it uses browser APIs, hooks, or interactivity. Prefer server components.
- Forms are **controlled components** — all inputs tracked with `useState`.
- Event handlers are prefixed with `handle` (e.g., `handleDelete`, `handleSave`).
- Destructive actions (delete) show a `window.confirm` dialog before calling the API.
- Loading states disable relevant buttons and show inline text feedback.

### Data Fetching

- **Server components** call `lib/episodes.ts` functions directly.
- **Client components** call REST endpoints via `fetch`.
- The homepage uses `export const dynamic = 'force-dynamic'` to prevent static caching.

### Error Handling

- Wrap async operations in `try/catch`.
- Surface errors to the user via state-driven message elements.
- Log to `console.error` for debugging; do not expose raw error objects to the UI.

---

## File Upload Flow

1. Browser calls `upload()` from `@vercel/blob/client` with `handleUpload` pointing to `/api/upload`.
2. `/api/upload` returns a client token (200 MB limit; allowed types: `.mp3 .m4a .ogg .wav .aac .flac`).
3. After upload resolves, the blob URL is used as `audioUrl` with `audioType: 'upload'`.
4. `onUploadCompleted` callback only fires in production (requires a public URL); locally the episode is saved directly after `upload()` resolves.

---

## Known Limitations / Gotchas

- External audio URLs may fail playback due to **CORS** headers on the source server.
- Blob `onUploadCompleted` callback **does not fire in local development** — this is expected behaviour.
- No automated tests — rely on `npm run lint` and `npm run build` to catch regressions.
- `ADMIN_PASSWORD` is stored in plaintext in the environment; treat it as a shared secret.
- Next.js image optimisation is configured to allow any `https` hostname (`hostname: '**'`) — tighten this in production if thumbnails come from a known set of domains.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo on Vercel (auto-detects Next.js).
2. In Vercel dashboard → **Storage** → connect a **Blob** store (`BLOB_READ_WRITE_TOKEN` auto-added).
3. In Vercel dashboard → **Marketplace** → install **Upstash Redis** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` auto-added).
4. Manually add `ADMIN_PASSWORD` in Vercel → **Settings → Environment Variables**.
5. Redeploy.
