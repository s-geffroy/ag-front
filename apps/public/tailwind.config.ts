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
        accent: v('--accent'),
        status: {
          on_track: v('--st-on'),
          at_risk: v('--st-risk'),
          blocked: v('--st-blocked'),
          not_started: v('--st-none'),
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4 Variable', 'Georgia', 'serif'],
      },
      maxWidth: { content: '72rem', prose: '46rem' },
    },
  },
} satisfies Config;
