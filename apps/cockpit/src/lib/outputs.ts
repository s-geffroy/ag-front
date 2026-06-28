import { FileText, Map as MapIcon, StickyNote, type LucideIcon } from 'lucide-react';
import type { Config, OutputTypeDef } from '@ag/schema/cockpit';

/**
 * Resolves the icon name stored in config (`output_types[].icon`) to a lucide component. Icons are
 * React components, not serializable — config can only carry a name. Add a line here only when a new
 * output type uses an icon not yet listed; everything else is a pure data change in config.json.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  FileText,
  Map: MapIcon,
  StickyNote,
};

export const outputIcon = (name: string): LucideIcon => ICON_REGISTRY[name] ?? FileText;

/** Find the output-type definition for a URL slug (e.g. 'fiches-atlas'). */
export function outputBySlug(config: Config, slug: string): OutputTypeDef | undefined {
  return config.output_types.find((o) => o.slug === slug);
}

/** Find the output-type definition for a content folder (e.g. 'atlas'), used by the reader's back link. */
export function outputByContentType(
  config: Config,
  contentType: string,
): OutputTypeDef | undefined {
  return config.output_types.find((o) => o.content_type === contentType);
}
