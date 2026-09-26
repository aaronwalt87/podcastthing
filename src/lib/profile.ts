/** Shared profile copy for the public site. */

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
  location: 'Wisconsin',
  /** One line. Appears in metadata and on the social card. */
  tagline: 'Infrastructure, modernization, and the logs in between.',

  /** The hero headline, in two lines. Keep both short. */
  heroLead: 'I lead technology.',
  heroLeadMuted: 'I still read the logs.',

  /** Used in the hero and at the top of the About page. */
  standfirst:
    "I've spent 14 years keeping B2B software and infrastructure useful, available, and moving forward — leading teams, migrating systems, and modernizing platforms with more history than documentation. I'm still learning to write software, but I'm shipping real things while I do it. This dashboard collects the technology news, market signals, and podcast episodes I genuinely follow. It is also what happened when I needed a hobby and apparently rejected several normal ones.",

  about: [
    {
      title: 'Fourteen years in the machinery',
      body: `I came up through hosting, IT, support, and the unglamorous systems that keep software companies functioning after the launch post is forgotten. Over 14 years, that grew into leading infrastructure and cloud migrations, modernizing legacy products, and building technical teams that can improve a system without first setting it on fire. I have developed a particular affection for important platforms with three generations of architecture and half a generation of documentation.`,
    },
    {
      title: 'Leading without leaving the keyboard',
      body: `Today I work where technology leadership, infrastructure, and product overlap. I help set direction, assess systems, lead technical teams, and turn vague concerns about reliability or technical debt into work somebody can actually finish. I also still open the logs when the dashboard says everything is healthy and everyone in the room knows that it is lying.`,
    },
    {
      title: 'Learning to build in public',
      body: `Software development is newer territory for me, and I am not going to dress 14 years of adjacent experience in a tiny fake mustache and call it 14 years of coding. What I do have is a long view of how software behaves once real people depend on it. I am learning by shipping useful things, documenting the tradeoffs, and resisting the urge to call every side project a platform.`,
    },
    {
      title: 'Why this site exists',
      body: `I wanted one place for the technology news I actually read, the market signals I use for context, and the podcast episodes worth finishing. Nothing quite matched the way I follow those things, so I built it. The result is equal parts personal dashboard, engineering playground, and evidence that I should probably have chosen a less complicated hobby.`,
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
      cost: "The sparklines can't be hovered for a value, and any new chart type is work rather than a config option. The trade is also narrower than it sounds: the sparklines ship as plain server-rendered SVG with no JavaScript at all, but the market ridge is a canvas, and its drawing code does run in the browser.",
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

  /** The kind of work this site should quietly attract. */
  lookingFor:
    "I'm most interested in infrastructure and platform leadership, especially when a business has inherited a critical system with good bones, old scars, and nobody particularly eager to touch it. That is usually where I am most useful.",

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
