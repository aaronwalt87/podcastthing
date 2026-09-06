import type { Config } from 'tailwindcss'

/**
 * Tailwind maps the CSS custom properties declared in globals.css.
 * The tokens live in one place (globals.css :root) — this file only
 * exposes them as utilities so components never hard-code a hex value.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--ink-950)',
          900: 'var(--ink-900)',
          850: 'var(--ink-850)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
        },
        paper: {
          DEFAULT: 'var(--paper)',
          2: 'var(--paper-2)',
          3: 'var(--paper-3)',
        },
        ember: {
          DEFAULT: 'var(--ember)',
          soft: 'var(--ember-2)',
          ghost: 'var(--ember-ghost)',
        },
        pos: 'var(--pos)',
        neg: 'var(--neg)',
        warn: 'var(--warn)',
        cool: 'var(--cool)',
        hair: 'var(--hair)',
        'hair-2': 'var(--hair-2)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        xs: 'var(--r-1)',
        sm: 'var(--r-2)',
        DEFAULT: 'var(--r-2)',
        md: 'var(--r-3)',
        lg: 'var(--r-4)',
      },
      maxWidth: {
        shell: '1320px',
        prose: '68ch',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
      boxShadow: {
        lift: 'var(--shadow-lift)',
        panel: 'var(--shadow-panel)',
      },
    },
  },
  plugins: [],
}

export default config
