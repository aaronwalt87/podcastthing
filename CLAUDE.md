# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Project

**Signal** — a personal technology dashboard for Aaron Walters. Three content
pillars in one place: a tech-news feed, a market board, and a podcast archive
with a real player. Deployed on Vercel, backed by Upstash Redis and Vercel Blob.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Upstash Redis ·
Vercel Blob

---

## Non-negotiables

These exist because the repo previously accumulated three half-applied design
systems that were reconciled at runtime with attribute selectors matching
serialised inline styles. Do not let that happen again.

1. **One design system.** `design.md` is the contract; `src/app/globals.css`
   `:root` is the source of truth. **Never hard-code a hex value in a
   component** — add a token instead. Never reintroduce `#00FF41`, `#FF3B3B`,
   `#67d7e1`, or the pine/sage palette.
2. **Never patch one palette over another** with `[style*="…"]` selectors or
   `!important` overrides. Fix the component.
3. **No dead code.** If a component is imported nowhere, delete it.
4. **No fabricated data in the UI.** No fake latency, uptime, or telemetry
   figures. Development fixtures live in `src/lib/sample-data.ts` and are
   gated to `NODE_ENV !== 'production'` with no Redis configured.
5. **Server components by default.** Add `'use client'` only for browser APIs,
   hooks, or interactivity.
6. **Accessibility is part of done** — see `design.md` §7.

---

## Structure

```
src/
├── app/
│   ├── page.tsx                    # Home: hero, market strip, news digest, episodes, colophon
│   ├── news/page.tsx               # Full news feed
│   ├── markets/page.tsx            # Board, sortable table, sector heatmap
│   ├── podcasts/page.tsx           # Searchable archive
│   ├── layout.tsx                  # Fonts, metadata, header/footer/player/palette
│   ├── globals.css                 # ALL design tokens + component recipes
│   ├── admin/                      # Password-gated episode CRUD
│   └── api/
│       ├── episodes/               # GET all, POST; GET/PUT/DELETE by id
│       ├── news/ + news/refresh/   # cached read; cron refresh (Bearer CRON_SECRET)
│       ├── stocks/ + stocks/refresh/
│       ├── search/                 # flat index behind the command palette
│       ├── auth/login|logout/
│       └── upload/                 # Vercel Blob client-upload handler
├── components/
│   ├── nav/       SiteHeader, CommandPalette
│   ├── home/      Hero, SignalField (canvas, driven by real market history)
│   ├── news/      NewsFeed, NewsDigest, NewsRow
│   ├── markets/   MarketStrip, MarketTable, SectorHeatmap, Sparkline, QuoteCard, Delta
│   ├── podcasts/  EpisodeArchive, EpisodeCard, EpisodeArtwork, PlayButton, AutoPlayOnLoad
│   ├── player/    PlayerBar
│   ├── admin/     EpisodeForm, EpisodeList, LoginForm
│   ├── ui/        Reveal, Spotlight, SectionHeader
│   └── SiteFooter.tsx
├── context/PlayerContext.tsx       # split Transport + Clock contexts
├── lib/           episodes, news, stocks, redis, format, auth, sample-data
├── middleware.ts                   # protects /admin/*
└── types/         episode, news, stocks
```

---

## Commands

```bash
npm run dev      # http://localhost:3000 — works with no env vars (fixtures)
npm run build    # production build
npm run lint     # ESLint
```

No test runner. `npm run lint` and `npm run build` are the gate.

---

## Data layer

**Always go through `src/lib/*`; never call Redis from a component or route
directly.** `src/lib/redis.ts` exports `getRedis()`, which returns `null` when
unconfigured — every caller must treat `null` as an empty store, not an error.

### Redis keys

```
episodes_index          sorted set; score = addedAt (ms), member = episode id
episodes:{id}           hash; Episode fields as strings
news:cache              JSON string; TTL = NEWS_TTL_SECONDS (default 172800 = 48h)
stocks:cache:v2         JSON MarketSnapshot; TTL 172800 = 48h
```

### Market data

`refreshStocks()` fetches 60 daily closes from Stooq (no key) and, when
`FINNHUB_TOKEN` is set, a live quote per symbol. The live quote wins; otherwise
the last two closes derive the change. Each `StockQuote` records its `source`.
**Bump the cache key** (`stocks:cache:v2`) whenever `MarketSnapshot` changes
shape — stale JSON of the old shape would otherwise deserialise into holes.

**Both TTLs must outlive the cron interval.** Vercel Hobby allows daily crons
only, so 48h leaves a full run of slack; a TTL shorter than the gap leaves the
site empty between runs, which is the failure this value exists to prevent.

### Formatting

Every number, date and duration renders through `src/lib/format.ts`. Do not
write a new local formatter. Pass a fixed `now` into `timeAgo()` from the server
so relative times don't shift between SSR and hydration.

---

## Player

`PlayerContext` deliberately exposes **two** contexts:

- `usePlayer()` — episode, transport controls, rate, queue. Changes rarely.
- `usePlayerClock()` — `currentTime` / `duration`. Ticks ~4×/second.

Subscribe to the clock **only** where a ticking value is displayed, or the whole
page re-renders on every frame.

Position is persisted per episode in `localStorage` (`signal:progress:v1`),
throttled to roughly every 5 seconds of playback.

---

## Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase files and names | `EpisodeCard.tsx` |
| lib / utils | lowercase | `format.ts` |
| Functions, vars | camelCase | `handleSubmit` |
| Constants | UPPER_SNAKE_CASE | `PROGRESS_KEY` |
| Path alias | `@/*` → `./src/*` | `import { num } from '@/lib/format'` |

- Forms are controlled components; handlers are prefixed `handle`.
- Destructive actions confirm first.
- Wrap async work in `try/catch`, surface a message in state, `console.error`
  the detail. Never render a raw error object.

---

## Gotchas

- Blob's `onUploadCompleted` callback does not fire in local development.
- External audio URLs may fail playback due to CORS on the source host; the
  player surfaces that as a message rather than failing silently.
- `next.config.mjs` allows images from any HTTPS host (`hostname: '**'`).
  Tighten it if thumbnails ever come from a known set of domains.
- `ADMIN_PASSWORD` is a single shared secret compared via HMAC. There is no
  user database.
- Vercel's Hobby plan permits daily crons only — `vercel.json` reflects that.
