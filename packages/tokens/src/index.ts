/**
 * Sober design tokens shared by apps/public (Astro) and apps/cockpit (React).
 * Intentionally small: a serious, low-chrome palette + restrained typography.
 * Consumed framework-agnostically (CSS variables, Tailwind preset, inline styles).
 */

export const colors = {
  ink: '#13151a', // primary text
  paper: '#ffffff', // surface
  muted: '#5b6470', // secondary text
  line: '#e3e6eb', // borders / separators
  accent: '#1f4e79', // restrained navy (maritime corridors)
  /** Operational status colours (cockpit health, deliverables, gates). */
  status: {
    on_track: '#1f7a4d',
    at_risk: '#b6761b',
    blocked: '#b3261e',
    not_started: '#8a909a',
  },
} as const;

export const fonts = {
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  serif: "'Source Serif 4', Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'JetBrains Mono', 'SFMono-Regular', monospace",
} as const;

export const radii = { sm: '4px', md: '8px', lg: '12px' } as const;

export const tokens = { colors, fonts, radii } as const;
export default tokens;
