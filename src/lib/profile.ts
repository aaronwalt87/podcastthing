/**
 * Everything about the site's owner lives here.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  EDIT THIS FILE. It is the one place the site says who you are.
 *  Any link left as an empty string is omitted from the UI rather than
 *  rendered dead, so it is safe to fill these in one at a time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface ProfileLink {
  label: string
  href: string
  external?: boolean
}

export const profile = {
  name: 'Aaron Walters',
  /** Shown in the hero kicker and the about page. */
  location: 'Colorado',
  /** One line. Appears in metadata and social cards. */
  tagline: 'Infrastructure, and the code on top of it.',

  /** The hero's second line. Keep it short — it sits under a large headline. */
  heroLead: 'I run infrastructure.',
  heroLeadMuted: 'Now I build it too.',

  /**
   * The about page, in order. Each entry becomes a titled section.
   * Written from what is true today — edit freely, but keep it specific.
   */
  about: [
    {
      title: 'What I have actually done',
      body: `Hosting, IT, IT support, and the software delivery process that runs between them. I have spent my career on the operational side of technology — the systems other people's code lands on, the escalation paths, the ticket queue, and the slow work of turning a support function into something that produces information instead of noise. I know what breaks at three in the morning, and I know it usually is not the code.`,
    },
    {
      title: 'What I am doing now',
      body: `Writing the software myself. I am newer at that than I am at operations, and I would rather say so here than have it discovered in a technical screen. What I bring to it is a long view of how software is actually run, which turns out to be a decent editorial sense for what is worth building and a low tolerance for things that only work on the happy path.`,
    },
    {
      title: 'Why this site exists',
      body: `I wanted one page that told me what happened in technology today, what the market underneath it did, and what was worth listening to. Nothing available did all three without an account, so I built it. Every part of it is a decision I can defend: why the cache sits where it does, why there is no charting library, why headlines are classified by keyword rather than by publisher.`,
    },
  ],

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
