# Before you share this link

The build is done. What's left is yours to write — and most of it lives in one
file, `src/lib/profile.ts`.

Items 1–5 are the difference between a site that shows you can build something
and a site that gets you a conversation. Items 6–9 are deployment.

---

## 1. Add your email address
**Where:** `src/lib/profile.ts`, the `links` list near the bottom.

There is currently no way for anyone who likes this site to reach you, which
makes the whole thing a dead end. Change `href: ''` to
`href: 'mailto:your@address.com'`. It appears immediately in the About sidebar
and in the footer of every page.

Any link you leave blank stays hidden rather than rendering broken, so you can
add these one at a time.

## 2. Put the code on GitHub and link it
**Where:** same `links` list.

This one matters most for the story the site tells. It says *"I'm new to writing
code, and this is what I built"* — and the natural next move for anyone reading
that is to look at the code. Right now there's nowhere to look.

Add `href: 'https://github.com/your-handle'`. Add LinkedIn too if you use it.

## 3. Say what you're after
**Where:** `src/lib/profile.ts`, the `lookingFor` field.

One or two sentences: the kind of role, whether you're remote or around
Colorado, what you're best at. There's a suggested version in the comment
directly above it — rewrite it in your own words.

While it's empty that section of the About page doesn't render at all, and the
site never asks for anything.

## 4. Put real details in your bio
**Where:** `src/lib/profile.ts`, the `about` list.

The best hour you can spend on this site. The copy currently says "hosting, IT,
and support" — all true, all *categories*, nothing a reader can hold onto. Above
each entry is a note marked `TO SHARPEN` saying exactly what's missing: how many
years, what kind of company, and one thing you actually did.

Two specific sentences will do more work than the three polished paragraphs
already sitting there.

## 5. Add one decision from your operations career
**Where:** `src/lib/profile.ts`, the `decisions` list — and put it first.

The Decisions page currently holds six choices about building this website.
They're accurate, and they're fine. But you've been making harder calls than
these for years, and none of them are on the page.

Add one — the migration you cut over on a Saturday, the monitoring you turned
off because it was lying, the escalation path you changed after an outage — in
the same three parts: **what you chose, what it beat, what it cost you.**

One entry like that changes the page from *"he can build a website"* to *"he's
been doing this a long time and the website is where it shows up most recently."*

While you're in there: read the six existing entries and confirm you'd defend
each one out loud. They were drafted for you, not by you, and the page invites
people to argue with them — so someone will. If you disagree with one, change it
or delete it. A shorter page you fully stand behind beats a longer one you'd
have to walk back in an interview.

---

## 6. Set the environment variables
**Where:** Vercel → Project → Settings → Environment Variables.

| Variable | Needed | What happens without it |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | **Yes** | The site is permanently empty in production |
| `ADMIN_PASSWORD` | **Yes** | Admin login fails closed — by design |
| `SESSION_SECRET` | **Yes**, 16+ chars | Login gets slow and flaky under load. `openssl rand -hex 32` |
| `CRON_SECRET` | **Yes** | Both refresh jobs return 401, so nothing ever populates |
| `NEXT_PUBLIC_SITE_URL` | Strongly | Every link preview and search result points at `aaronwalters.dev` |
| `BLOB_READ_WRITE_TOKEN` | For uploads | Audio file upload won't work |
| `FINNHUB_TOKEN` | Optional | Market board falls back to end-of-day closes — it still works |

`NEXT_PUBLIC_SITE_URL` also goes in your local `.env.local` file. No trailing
slash, e.g. `https://example.com`. If `aaronwalters.dev` *is* your domain,
there's nothing to do.

## 7. Add episodes that actually play
**Where:** the admin panel at `/admin`.

The episodes you see while developing are samples with no audio, which is why
some rows say "No audio". Real episodes with working audio URLs make the player
— the most impressive interactive thing on the site — actually do something.
Three real ones beat six samples.

If a publisher offers a transcript, paste it into the Transcript URL field. It's
the text alternative that makes the audio accessible to Deaf and hard-of-hearing
visitors, and the archive counts how many episodes have one.

## 8. Watch the first deploy
After the first deploy, confirm both cron jobs appear in the Vercel dashboard,
and that the first run populates the caches. A cold cache warms itself in the
background, so this should cover itself — but it's the one thing worth watching
once.

## 9. Look at it the way a stranger will
Open your deployed URL, not localhost. Locally you see a "sample data" notice
and invented headlines; on the real deployment you'll see live feeds instead,
and anything still empty will show an empty state. Click every page.

Then paste your link into Slack or a LinkedIn message box and look at the
preview card — your name, your tagline, the dark image. If it looks wrong or
names the wrong domain, that traces back to item 6.

---

## What this site is now

The typography is tuned rather than defaulted, the colour system holds to one
accent with real discipline, and the market board and sector heatmap are better
pieces of data design than most commissioned dashboards ship with. It meets
WCAG 2.2 AA with one named exception (episodes whose publisher provides no
transcript). Nothing on it is fabricated: every number has a stated source, and
the development fixtures are gated so they can never reach production.

The Decisions page is what lifts it from a well-built dashboard to a case for
hiring you — it's the only place someone can watch you exercise judgement and
see what you were willing to pay for it.

**The site now asks the reader to argue with you on three separate pages, and
gives them no way to do it.** Every hour of work here is in service of a
conversation that currently cannot happen. That's item 1, and it's one line.
