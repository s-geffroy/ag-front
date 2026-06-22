import type { Config } from 'tailwindcss';
import { tailwindPreset } from '../../packages/tokens/src/tailwind-preset';

// Semantic colours resolve to CSS variables so the whole UI flips with the `.dark` class.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  presets: [tailwindPreset as unknown as Partial<Config>],
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
    },
  },
} satisfies Config;
