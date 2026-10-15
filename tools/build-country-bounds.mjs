// Génère src/app/data/country-bounds.ts : le cadre de la carte de chaque pays.
// Source : Natural Earth 1:10m, pays (domaine public), https://www.naturalearthdata.com
//   node tools/build-country-bounds.mjs ne_10m_admin_0_countries.geojson
// Le cadre englobe le territoire principal : les terres éloignées de plus de 8 % de sa taille (2° au moins) en sont
// écartées (la Guyane n'élargit pas la carte de la France, l'Alaska non plus celle des États-Unis).
import { readFileSync, writeFileSync } from 'node:fs';

const [geojsonPath] = process.argv.slice(2);
if (!geojsonPath) {
  console.error('Usage : node tools/build-country-bounds.mjs <ne_10m_admin_0_countries.geojson>');
  process.exit(1);
}

const countriesSource = ['africa', 'americas', 'asia', 'europe', 'oceania']
  .map((f) => readFileSync(new URL(`../src/app/data/${f}.ts`, import.meta.url), 'utf8'))
  .join('\n');
const codes = [...countriesSource.matchAll(/code: '([a-z]{2})'/g)].map((m) => m[1]).sort();

const collection = JSON.parse(readFileSync(geojsonPath, 'utf8'));
const polygons = new Map(); // code -> [{ w, s, e, n }]
for (const { properties, geometry } of collection.features) {
  const code = [properties.ISO_A2_EH, properties.ISO_A2, properties.WB_A2]
    .map((c) => c?.toLowerCase())
    .find((c) => c && c !== '-99');
  if (!code) continue;
  const rings = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const boxes = rings.map(([outer]) => {
    const lons = outer.map((p) => p[0]);
    const lats = outer.map((p) => p[1]);
    return {
      w: Math.min(...lons),
      s: Math.min(...lats),
      e: Math.max(...lons),
      n: Math.max(...lats),
    };
  });
  polygons.set(code, [...(polygons.get(code) ?? []), ...boxes]);
}

// Les archipels dont la plus grande île n'est pas le cœur du pays, ou à cheval sur l'antiméridien : cadre posé à la main.
const OVERRIDES = {
  ki: [171.5, -3.5, 177.5, 4.5], // les îles Gilbert, où se trouve Tarawa
  sc: [54.9, -5.27, 56.03, -4.07], // Mahé, Praslin et La Digue
};

const size = (b) => Math.max(b.e - b.w, b.n - b.s);
const round = (x) => Math.round(x * 100) / 100;

function bounds(boxes) {
  const sorted = [...boxes].sort((a, b) => size(b) - size(a));
  let box = { ...sorted[0] };
  const rest = sorted.slice(1);
  for (let grown = true; grown;) {
    grown = false;
    for (const b of [...rest]) {
      const gap = Math.max(b.w - box.e, box.w - b.e, b.s - box.n, box.s - b.n, 0);
      if (gap <= Math.max(0.08 * size(box), 2)) {
        box = {
          w: Math.min(box.w, b.w),
          s: Math.min(box.s, b.s),
          e: Math.max(box.e, b.e),
          n: Math.max(box.n, b.n),
        };
        rest.splice(rest.indexOf(b), 1);
        grown = true;
      }
    }
  }
  // Marge de 10 % (3° au plus), et au moins 1,2° de côté pour que les îles minuscules restent lisibles.
  const pad = Math.max(Math.min(size(box) * 0.1, 3), 0.6 - size(box) / 2);
  const clamp = (x, limit) => Math.max(-limit, Math.min(limit, x));
  return [
    clamp(box.w - pad, 180),
    clamp(box.s - pad, 85),
    clamp(box.e + pad, 180),
    clamp(box.n + pad, 85),
  ].map(round);
}

const missing = codes.filter((c) => !polygons.has(c));
if (missing.length) throw new Error(`Pays absents de Natural Earth : ${missing.join(', ')}`);

const lines = codes.map(
  (c) => `  ${c}: [${(OVERRIDES[c] ?? bounds(polygons.get(c))).join(', ')}],`,
);
writeFileSync(
  new URL('../src/app/data/country-bounds.ts', import.meta.url),
  `/**
 * Cadre de la carte de chaque pays : [ouest, sud, est, nord], en degrés.
 * Généré par tools/build-country-bounds.mjs à partir de Natural Earth (domaine public) : ne pas éditer à la main.
 */
export const COUNTRY_BOUNDS: Readonly<Record<string, readonly [number, number, number, number]>> = {
${lines.join('\n')}
};
`,
);
console.log(`${codes.length} pays écrits.`);
