import type { Config } from 'tailwindcss';

// Semantic colours resolve to CSS variables so the site flips with the `.dark` class.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: v('--canvas'),
        surface: v('--surface'),
        subtle: v('--subtle'),
        ink: v('--ink'),
        muted: v('--muted'),
        line: v('--line'),
        hairline: v('--hairline'),
        accent: v('--accent'),
        navy: v('--navy'),
        // Calibrated CVI vulnerability ramp (bas → critique).
        cvi: {
          1: v('--cvi-1'),
          2: v('--cvi-2'),
          3: v('--cvi-3'),
          4: v('--cvi-4'),
        },
        status: {
          on_track: v('--st-on'),
          at_risk: v('--st-risk'),
          blocked: v('--st-blocked'),
          not_started: v('--st-none'),
        },
      },
      fontFamily: {
        // UI chrome (nav, buttons, tables) stays on Inter.
        sans: ['Inter Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Display / headings — Fraunces, a high-character editorial serif.
        serif: ['Fraunces Variable', 'Georgia', 'serif'],
        // Long-form reading body — Newsreader, optimised on screen.
        prose: ['Newsreader Variable', 'Georgia', 'serif'],
        // Instrument layer — coordinates, CVI scores, datelines, sources.
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Editorial display sizes with built-in tight leading (tuned for Fraunces).
        display: ['clamp(2.4rem, 5vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        title: ['clamp(1.9rem, 3vw, 2.6rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      maxWidth: { content: '74rem', prose: '44rem' },
      borderRadius: { DEFAULT: '2px' },
    },
  },
} satisfies Config;
