import { colors, fonts, radii } from './index';

const families = (stack: string): string[] => stack.split(',').map((s) => s.trim());

/**
 * Minimal Tailwind preset. Typed loosely on purpose so this package needs no
 * `tailwindcss` dependency — apps include it via `presets: [tailwindPreset]`.
 */
export const tailwindPreset = {
  theme: {
    extend: {
      colors: {
        ink: colors.ink,
        paper: colors.paper,
        muted: colors.muted,
        line: colors.line,
        accent: colors.accent,
        status: colors.status,
      },
      fontFamily: {
        sans: families(fonts.sans),
        serif: families(fonts.serif),
        mono: families(fonts.mono),
      },
      borderRadius: { sm: radii.sm, md: radii.md, lg: radii.lg },
    },
  },
};

export default tailwindPreset;
