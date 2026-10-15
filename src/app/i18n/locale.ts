/** Les langues du site : le français est à la racine, l'anglais sous `/en/`. */
export type Locale = 'fr' | 'en';

export const LOCALES: readonly Locale[] = ['fr', 'en'];

export const DEFAULT_LOCALE: Locale = 'fr';

/** Langue d'une adresse : `/en` et `/en/…` sont en anglais, tout le reste en français. */
export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? 'en' : DEFAULT_LOCALE;
}

/** Adresse de la page d'accueil dans une langue. */
export function pathFor(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/';
}
