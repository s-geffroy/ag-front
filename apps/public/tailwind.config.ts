import type { Config } from 'tailwindcss';
import { tailwindPreset } from '../../packages/tokens/src/tailwind-preset';

export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  presets: [tailwindPreset as unknown as Partial<Config>],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4 Variable', 'Georgia', 'serif'],
      },
      maxWidth: { content: '72rem', prose: '46rem' },
    },
  },
} satisfies Config;
