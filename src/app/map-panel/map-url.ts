import { COUNTRY_BOUNDS } from '../data/country-bounds';

/** Sous cette taille (en degrés), le pays est un point sur la carte : on le repère d’un marqueur. */
const MARKER_BELOW = 4;

/**
 * URL d’intégration OpenStreetMap pour un pays, sans clé d’API : la carte cadre le pays (`COUNTRY_BOUNDS`).
 * Le code vient de nos données, jamais d’une saisie.
 */
export function mapUrl(code: string): string {
  const bounds = COUNTRY_BOUNDS[code];
  if (!bounds) throw new Error(`Pas de cadre de carte pour « ${code} »`);
  const [west, south, east, north] = bounds;
  const params = new URLSearchParams({ bbox: bounds.join(','), layer: 'mapnik' });
  if (Math.max(east - west, north - south) < MARKER_BELOW) {
    params.set('marker', `${(south + north) / 2},${(west + east) / 2}`);
  }
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}
