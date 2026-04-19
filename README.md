# PODCAST//TERM — AI Tech Terminal

An AI/tech news terminal with a curated podcast episode archive. Features a live intelligence feed aggregating headlines from OpenAI, VentureBeat, The Verge, TechCrunch, Ars Technica, Wired, and Hacker News — displayed alongside podcast episodes in an editorial layout.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — The Analog Frontier design system (dark terminal aesthetic)
- **Vercel Blob** — audio file storage (public CDN)
- **Upstash Redis** — episode metadata + news feed cache

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `ADMIN_PASSWORD` | Admin panel password |
| `CRON_SECRET` | Bearer token for the news refresh endpoint |

Generate `CRON_SECRET` with: `openssl rand -hex 32`

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## News Feed

The `[LIVE_TELEMETRY_]` sidebar pulls from:
- **RSS:** OpenAI blog, VentureBeat AI, The Verge AI, TechCrunch AI, Ars Technica, Wired AI
- **Hacker News:** Top AI/LLM stories via Algolia search API

Refresh the cache manually:
```bash
curl -X GET https://<your-domain>/api/news/refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

Cache TTL: `NEWS_TTL_SECONDS` env var (default 7200s = 2h).

## Vercel Deployment

```bash
npx vercel --prod
```

1. Connect a **Blob store** in Vercel dashboard → Storage → `BLOB_READ_WRITE_TOKEN` auto-added
2. Install **Upstash Redis** from Vercel Marketplace → tokens auto-added
3. Add `ADMIN_PASSWORD` and `CRON_SECRET` manually in Vercel → Settings → Environment Variables
4. After deploy, seed the news cache: `curl .../api/news/refresh -H "Authorization: Bearer $CRON_SECRET"`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout: TopNav + PlayerProvider + AudioPlayerBar
│   ├── page.tsx                 # Homepage: 2-column (episodes + news sidebar)
│   ├── globals.css              # Analog Frontier tokens, IBM Plex Mono, animations
│   ├── admin/page.tsx           # Admin dashboard (client component)
│   └── api/
│       ├── auth/                # Login/logout cookie auth
│       ├── episodes/            # Episode CRUD
│       ├── news/route.ts        # GET cached news items
│       ├── news/refresh/route.ts # GET (cron) — refresh news cache
│       └── upload/route.ts      # Vercel Blob upload handler
├── components/
│   ├── TopNav.tsx               # Fixed top nav bar (hidden on /admin)
│   ├── NewsReadout.tsx          # LIVE_TELEMETRY_ sidebar list
│   ├── EpisodeGrid.tsx          # Featured-first editorial grid
│   ├── EpisodeCard.tsx          # 16:9 editorial article card
│   ├── AudioPlayerBar.tsx       # Fixed bottom audio player
│   ├── CategoryTabs.tsx         # Category filter chips
│   └── admin/                   # Admin-only components
├── context/PlayerContext.tsx    # Global audio player state
├── lib/
│   ├── episodes.ts              # Episode CRUD (Redis)
│   ├── news.ts                  # RSS + HN fetch, Redis cache
│   └── redis.ts                 # Upstash client
└── types/
    ├── episode.ts
    └── news.ts                  # NewsItem interface
```

## Admin

Navigate to `/admin`. Protected by `ADMIN_PASSWORD` via HMAC-SHA256 cookie session.

- Add episodes via URL paste or file upload (MP3, M4A, OGG, WAV, AAC, FLAC — 200 MB limit)
- Edit metadata and categories
- Delete episodes
