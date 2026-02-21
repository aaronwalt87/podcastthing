# Podcast Showcase

A minimal, dark-themed personal podcast episode showcase website. Browse curated episode cards and listen via a persistent bottom audio player. Episodes can be added via the admin UI at `/admin` by pasting an external audio URL or uploading an MP3.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — monochromatic dark palette
- **Vercel Blob** — audio file storage (public CDN)
- **Upstash Redis** — episode metadata persistence

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

```env
BLOB_READ_WRITE_TOKEN=       # from Vercel Blob store
UPSTASH_REDIS_REST_URL=      # from Upstash Redis
UPSTASH_REDIS_REST_TOKEN=    # from Upstash Redis
```

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The Vercel Blob `onUploadCompleted` callback won't fire in local dev (requires a public URL). Episodes are saved from the client after `upload()` resolves instead, so uploads work normally locally.

## Vercel Deployment

1. Push to GitHub → import into Vercel (Next.js preset)
2. **Blob:** Vercel dashboard → Storage → Create Blob store → Connect to project
   → `BLOB_READ_WRITE_TOKEN` added automatically
3. **Redis:** Vercel Marketplace → Upstash → Install → Connect to project
   → `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` added automatically
4. `vercel env pull .env.local` to sync secrets locally
5. Redeploy after connecting storage

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout with PlayerProvider + AudioPlayerBar
│   ├── page.tsx                 # Homepage (server component)
│   ├── admin/page.tsx           # Admin UI (client component)
│   └── api/
│       ├── episodes/route.ts    # GET all, POST create
│       ├── episodes/[id]/route.ts  # GET, PUT, DELETE
│       └── upload/route.ts      # Vercel Blob upload token handler
├── components/
│   ├── EpisodeGrid.tsx
│   ├── EpisodeCard.tsx
│   ├── AudioPlayerBar.tsx
│   └── admin/
│       ├── EpisodeForm.tsx
│       └── EpisodeList.tsx
├── context/PlayerContext.tsx
├── lib/
│   ├── redis.ts
│   └── episodes.ts
└── types/episode.ts
```

## Admin UI

Navigate to `/admin` to:
- Add episodes via URL paste or file upload
- Edit episode metadata
- Delete episodes

No authentication — this is a personal site. Keep `/admin` private by URL obscurity or add your own auth layer.

## Known Limitations

- **CORS on external audio URLs:** Some podcast CDNs block cross-origin browser requests. If playback fails for a URL-based episode, download and re-upload the file instead.
- **File upload size limit:** 200 MB (configurable in `src/app/api/upload/route.ts`).
