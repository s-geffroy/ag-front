import type { APIRoute } from 'astro';
import { loadGeoJson } from '../../lib/atlas-data';

// Static at build: the clear (non-tainted) chokepoints GeoJSON, served same-origin for the map island.
export const GET: APIRoute = async () => {
  const fc = await loadGeoJson();
  return new Response(JSON.stringify(fc), {
    headers: { 'content-type': 'application/geo+json; charset=utf-8' },
  });
};
