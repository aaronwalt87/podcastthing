/**
 * Everything about the site's owner lives here.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  READ THIS BEFORE DEPLOYING.
 *
 *  The `about` copy below was drafted from a general description of this
 *  background. The shape is right; the specifics are missing, and a biography
 *  made only of categories reads as "nothing to point to" — which is the
 *  opposite of true for a long operations career.
 *
 *  Nothing here renders as a placeholder: the site ships clean as-is. But the
 *  four items below are what turn it from competent into convincing.
 *
 *  BEFORE THIS GOES LIVE:
 *    1. `links` — at minimum an email. GitHub matters more than usual here:
 *       the whole claim is "new to writing code, here is my code", and without
 *       it there is nothing to read. An empty href is omitted, never rendered
 *       dead, so fill them in one at a time.
 *    2. `lookingFor` — the page has no ask without it. Left empty, the section
 *       simply does not render.
 *    3. Put real nouns in `about`. Years, the kind of company, one story you
 *       actually remember. See the notes above each entry — every concrete
 *       detail you add is worth a paragraph of prose.
 *    4. Set NEXT_PUBLIC_SITE_URL. It feeds the canonical tags and the social
 *       card; the default is a guess and, if the domain is not yours, points
 *       every share at a stranger's site.
 *
 *  `tagline`, `heroLead` and `heroLeadMuted` are the first words anyone reads.
 *  Say them the way you would say them out loud.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ProfileLink {
  label: string
  href: string
  external?: boolean
}

export interface AboutSection {
  title: string
  body: string
}

export interface Decision {
  /** Short, declarative. "Cache stale data rather than show none." */
  title: string
  /** What was chosen, and the alternative it was chosen over. */
  choice: string
  /** The honest cost. An entry with no cost is marketing, not a decision. */
  cost: string
}

export const profile = {
  name: 'Aaron Walters',
  /** Shown in the header lockup, the hero kicker and the about page. */
  location: 'Colorado',
  /** One line. Appears in metadata and on the social card. */
  tagline: 'Infrastructure, and the code on top of it.',

  /** The hero headline, in two lines. Keep both short. */
  heroLead: 'I run infrastructure.',
  heroLeadMuted: 'Now I build it too.',

  /**
   * The line that introduces you, used in the hero AND at the top of /about.
   * Four beats: credential, concession, evidence, what-it-is. The concession
   * sits in the middle, where it reads as confidence rather than apology.
   *
   * Sharper with a number: "I've spent fifteen years keeping other people's
   * software running…". Add one if you are comfortable stating it.
   */
  standfirst:
    "I've spent my career keeping other people's software running — hosting, IT, support, and the delivery process around all three. I'm new to writing it. This site is the largest thing I've built: technology news, the market underneath it, and the episodes worth finishing, collected and refreshed on a schedule. It's where I learn in public.",

  about: [
    {
      title: 'Where I come from',
      /**
       * TO SHARPEN: name the kind of company ("a regional hosting provider",
       * "an MSP serving mid-market healthcare"), and add two sentences about
       * one thing you actually did — the migration you ran, the outage you
       * still think about, the process you rebuilt and what changed. That is
       * the highest-value edit on this page.
       */
      body: `Hosting, IT, and support, and the software delivery process that runs between them. I've spent my career on the operational side of technology: the systems other people's code lands on, the escalation paths, the ticket queue, and the slow work of turning a support function into something that produces information instead of noise. I know what a system looks like at three in the morning — and how much of whether it holds was decided months earlier, by people who never got paged.`,
    },
    {
      title: "What I'm doing now",
      /**
       * TO SHARPEN: say when you started and what the first thing was, however
       * small. "A script that reconciled two ticket systems" beats any
       * adjective.
       */
      body: `Writing the software myself. I'm newer at that than I am at operations, and I'd rather say so here than have it come out in a technical screen. What I bring to it is a long view of how software actually gets run — which turns out to be a decent editorial sense for what's worth building, and a low tolerance for things that only work on the happy path.`,
    },
    {
      title: 'Why this site exists',
      body: `I wanted one page that told me what happened in technology today, what the market underneath it did, and what was worth listening to. Nothing available did all three without an account, so I built it. Every part of it is a decision I can defend: why the cache sits where it does, why there's no charting library, why headlines are classified by keyword rather than by publisher.`,
    },
  ] as AboutSection[],

  /**
   * A record of choices made in this build, and what each one cost.
   *
   * ───────────────────────────────────────────────────────────────────────────
   *  THIS IS THE MOST VALUABLE PAGE ON THE SITE, AND THE LEAST FINISHED.
   *
   *  Everything else here presents other people's work — their headlines,
   *  their trades, their conversations. This is the only page that shows YOUR
   *  judgement, which is the actual hiring question.
   *
   *  The entries below are real: each one describes a decision visible in this
   *  codebase, and each names what it cost. But they were drafted, not written
   *  by you. Two things to do:
   *
   *    1. Read each one and make sure you agree. If you would have chosen
   *       differently, change the code or change the entry — either is a
   *       better answer than leaving a decision you cannot defend.
   *    2. Add your own, and not only about this site. The strongest entries
   *       will be from your operations career: the migration you cut over on a
   *       Saturday, the monitoring you turned off because it was lying, the
   *       escalation path you rewrote. "I chose X over Y, because Z, and here
   *       is what it cost" is the whole format.
   *
   *  Left empty, this section does not render at all.
   * ───────────────────────────────────────────────────────────────────────────
   */
  decisions: [
    {
      title: 'No charting library',
      choice:
        'The trend lines are server-rendered SVG and the ridge is a hand-written canvas, rather than pulling in a charting package.',
      cost: "The sparklines can't be hovered for a value, and any new chart type is work rather than a config option. The trade is also narrower than it sounds: the sparklines ship as plain server-rendered SVG with no JavaScript at all, but the hero ridge is a canvas, and its drawing code does run in the browser.",
    },
    {
      title: 'Cache stale data rather than show none',
      choice:
        'Feed and quote caches outlive their refresh interval by a full extra run, so a missed job leaves yesterday on screen instead of an empty page.',
      cost: "A headline can be up to two days old if the scheduled job fails repeatedly. The timestamp is on the page, but it's small, and someone skimming will miss it.",
    },
    {
      title: 'The market board works with no API key',
      choice:
        'Live quotes when a key is configured; end-of-day closes from a keyless source when it is not. Every quote records which it was.',
      cost: 'Without a key the numbers are yesterday, and someone who does not read the label could mistake them for live. That is why the label is not optional.',
    },
    {
      title: 'Playback position lives in the browser, not on a server',
      choice:
        'Where you stopped listening is kept in local storage, with no account and no record of it anywhere else.',
      cost: 'It does not follow you to another device, and clearing site data loses it. Nobody has to trust me with a listening history to use the player.',
    },
    {
      title: 'Keyboard shortcuts are off until asked for',
      choice:
        'Single-key controls — space, J, K, L, M — are opt-in per browser rather than always live.',
      cost: 'Almost nobody will find them. Those same keys are how screen-reader users navigate, and taking them by default breaks the page for people who need it most.',
    },
    {
      title: 'Two contexts for one audio player',
      choice:
        'Transport state and the playback clock are separate React contexts, so the four-times-a-second tick reaches only the scrubber.',
      cost: "More moving parts than one context, and a rule a future reader has to know before touching it: subscribe to the clock and you re-render on every tick. Nothing in the code stops someone getting that wrong.",
    },
  ] as Decision[],

  /**
   * The ask. Renders as its own section, and is skipped entirely while empty.
   * Something like: "Platform, infrastructure or support-engineering work,
   * remote or around Colorado. I'm most useful where operations and product
   * meet — the place where what customers report turns into what gets built."
   */
  lookingFor: '',

  /**
   * Contact and profile links. FILL THESE IN — an empty href is hidden.
   * Example: { label: 'GitHub', href: 'https://github.com/your-handle', external: true }
   */
  links: [
    { label: 'Email', href: 'mailto:walt.aaron@gmail.com', external: false },
    { label: 'GitHub', href: '', external: true },
    { label: 'LinkedIn', href: '', external: true },
  ] as ProfileLink[],
}

/** Only the links that have actually been filled in. */
export function activeLinks(): ProfileLink[] {
  return profile.links.filter((link) => link.href.trim().length > 0)
}
