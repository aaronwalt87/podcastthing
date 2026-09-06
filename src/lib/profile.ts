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
    { label: 'Email', href: '', external: false },
    { label: 'GitHub', href: '', external: true },
    { label: 'LinkedIn', href: '', external: true },
  ] as ProfileLink[],
}

/** Only the links that have actually been filled in. */
export function activeLinks(): ProfileLink[] {
  return profile.links.filter((link) => link.href.trim().length > 0)
}
