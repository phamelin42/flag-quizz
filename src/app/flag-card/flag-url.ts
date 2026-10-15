import { Country } from '../data/country';

/** Adresse du SVG d'un drapeau (copié dans `flags/4x3/` par `angular.json`). */
export function flagUrl(country: Country): string {
  return `flags/4x3/${country.code}.svg`;
}
