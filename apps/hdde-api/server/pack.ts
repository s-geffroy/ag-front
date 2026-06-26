// Domain-pack singleton: loaded once at startup and reused. Exposes the active pack + its hash.
import { loadPack } from './engine';
import type { DomainPack } from './engine';
import { config } from './config';

let cached: DomainPack | null = null;

export function getPack(): DomainPack {
  if (!cached) cached = loadPack(config.packDir);
  return cached;
}
