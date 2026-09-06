# Signal

A personal technology dashboard: a tech-news feed, a market board for the names
that move it, and a podcast archive with a real player — in one place, cached
server-side and refreshed on a schedule.

Built with **Next.js 14 (App Router)**, TypeScript, Tailwind, Upstash Redis and
Vercel Blob. The design system is documented in [`design.md`](./design.md).

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

**No credentials required to run locally.** With no Redis configured and
`NODE_ENV !== 'production'`, the site renders development fixtures
(`src/lib/sample-data.ts`) so the layout is immediately reviewable. Production
never uses them — an unconfigured production deploy shows real empty states.

To run against real data, copy the example env file and fill in what you need:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | for real data | Cache + episode store |
| `UPSTASH_REDIS_REST_TOKEN` | for real data | — |
| `ADMIN_PASSWORD` | for `/admin` | Shared admin password |
| `CRON_SECRET` | for refresh jobs | Bearer token on the refresh endpoints |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Vercel Blob audio storage |
| `FINNHUB_TOKEN` | optional | Intraday quotes; without it the board uses keyless end-of-day closes |
| `NEWS_TTL_SECONDS` | optional | News cache TTL, default `7200` |

---

## What's in it

### News — `/news`
Sixteen RSS and Atom feeds plus six Hacker News queries, parsed server-side,
deduplicated by content hash, and classified by keyword so a story lands in the
section it belongs to rather than the one its publisher sits in. Searchable and
filterable by category and source.

### Markets — `/markets`
Sixteen tech names and two index proxies with 60-day trend lines, a sortable
board, sector heatmap and breadth readout.

Quotes come from Finnhub when `FINNHUB_TOKEN` is set, and fall back to Stooq
end-of-day closes when it isn't — so the board renders without any key, and each
quote records which source it came from. Sparklines are server-rendered SVG; no
charting library ships to the browser.

### Podcasts — `/podcasts`
Searchable, filterable and sortable archive. The player keeps a per-episode
position in `localStorage`, supports playback rate, ±15/30s skip, a queue, OS
media controls via the Media Session API, and keyboard shortcuts.

### Command palette
`⌘K` / `Ctrl-K`, or `/` outside a text field. Searches episodes, headlines and
tickers through `/api/search`.

### Admin — `/admin`
Password-gated episode CRUD with direct-to-Blob audio upload.

---

## Architecture notes

- **Server components by default.** `'use client'` appears only where a
  component needs interactivity. News rows, sparklines and quote cards render
  on the server.
- **Playback position lives in its own React context** (`ClockContext`)
  separate from transport state, so the clock ticking four times a second
  re-renders the scrubber and nothing else.
- **Redis is lazy and null-safe.** A missing or failing store degrades to an
  empty state, never a 500.
- **All colour comes from CSS custom properties** in `src/app/globals.css`,
  mapped into Tailwind by `tailwind.config.ts`. No component hard-codes a hex.

```
src/
├── app/                    # routes: / /news /markets /podcasts /admin + api
├── components/
│   ├── nav/                # SiteHeader, CommandPalette
│   ├── home/               # Hero, SignalField (canvas)
│   ├── news/               # NewsFeed, NewsDigest, NewsRow
│   ├── markets/            # MarketStrip, MarketTable, SectorHeatmap, Sparkline, QuoteCard, Delta
│   ├── podcasts/           # EpisodeArchive, EpisodeCard, EpisodeArtwork, PlayButton
│   ├── player/             # PlayerBar
│   ├── admin/              # EpisodeForm, EpisodeList, LoginForm
│   └── ui/                 # Reveal, Spotlight, SectionHeader
├── context/PlayerContext.tsx
├── lib/                    # episodes, news, stocks, redis, format, auth, sample-data
└── types/
```

---

## Scheduled refresh

Two cron jobs (see `vercel.json`) hit authenticated refresh endpoints:

```bash
curl https://<your-domain>/api/news/refresh   -H "Authorization: Bearer $CRON_SECRET"
curl https://<your-domain>/api/stocks/refresh -H "Authorization: Bearer $CRON_SECRET"
```

Vercel's Hobby plan allows daily crons only; the schedules in `vercel.json`
reflect that.

---

## Deployment

1. Import the repo on Vercel (Next.js is auto-detected).
2. **Storage → Blob** — connect a store (`BLOB_READ_WRITE_TOKEN` is added
   automatically).
3. **Marketplace → Upstash Redis** — install it (both Redis vars are added
   automatically).
4. Add `ADMIN_PASSWORD`, `CRON_SECRET`, and optionally `FINNHUB_TOKEN` under
   **Settings → Environment Variables**.
5. Redeploy.

---

## Checks

```bash
npm run lint
npm run build
```

There is no test runner configured; lint and a production build are the gate.
