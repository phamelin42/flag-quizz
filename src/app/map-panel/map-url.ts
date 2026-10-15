/** URL d’intégration Google Maps pour un pays, sans clé d’API. Le nom vient de nos données, jamais d’une saisie. */
export function mapUrl(countryName: string, language = 'fr'): string {
  const params = new URLSearchParams({ q: countryName, output: 'embed', hl: language });
  return `https://www.google.com/maps?${params.toString()}`;
}
