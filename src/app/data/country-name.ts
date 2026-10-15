import { DEFAULT_LOCALE, Locale } from '../i18n/locale';

const displayNames: Readonly<Record<Locale, Intl.DisplayNames>> = {
  fr: new Intl.DisplayNames(['fr'], { type: 'region' }),
  en: new Intl.DisplayNames(['en'], { type: 'region' }),
};

/** Noms que la locale rend de façon trop lourde pour un bouton de quiz. */
const OVERRIDES: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  fr: {
    va: 'Vatican',
    ps: 'Palestine',
  },
  en: {
    cd: 'DR Congo',
    cg: 'Republic of the Congo',
    mm: 'Myanmar',
    ps: 'Palestine',
  },
};

/** Nom d'un pays à partir de son code ISO 3166-1 alpha-2, en français par défaut. */
export function countryName(code: string, locale: Locale = DEFAULT_LOCALE): string {
  const key = code.toLowerCase();
  return OVERRIDES[locale][key] ?? displayNames[locale].of(key.toUpperCase()) ?? key.toUpperCase();
}
