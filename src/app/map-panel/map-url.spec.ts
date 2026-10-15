import { COUNTRY_LIST } from '../data/countries';
import { COUNTRY_BOUNDS } from '../data/country-bounds';
import { mapUrl } from './map-url';

describe('mapUrl', () => {
  it('construit l’URL d’intégration OpenStreetMap, cadrée sur le pays', () => {
    const url = new URL(mapUrl('jp'));
    expect(url.origin).toBe('https://www.openstreetmap.org');
    expect(url.pathname).toBe('/export/embed.html');
    expect(url.searchParams.get('layer')).toBe('mapnik');
    expect(url.searchParams.get('bbox')).toBe(COUNTRY_BOUNDS['jp'].join(','));
  });

  it('pose un marqueur sur un petit pays, pas sur un grand', () => {
    expect(new URL(mapUrl('mc')).searchParams.get('marker')).toMatch(/^43\.\d+,7\.\d+$/);
    expect(new URL(mapUrl('ru')).searchParams.has('marker')).toBe(false);
  });

  it('refuse un pays sans cadre', () => {
    expect(() => mapUrl('zz')).toThrow();
  });

  it('a un cadre cohérent pour chacun des pays du quiz', () => {
    for (const { code } of COUNTRY_LIST) {
      const [west, south, east, north] = COUNTRY_BOUNDS[code];
      expect(west, code).toBeLessThan(east);
      expect(south, code).toBeLessThan(north);
      expect(west, code).toBeGreaterThanOrEqual(-180);
      expect(east, code).toBeLessThanOrEqual(180);
      expect(south, code).toBeGreaterThanOrEqual(-85);
      expect(north, code).toBeLessThanOrEqual(85);
    }
    expect(Object.keys(COUNTRY_BOUNDS)).toHaveLength(COUNTRY_LIST.length);
  });
});
