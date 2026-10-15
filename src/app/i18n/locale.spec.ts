import { localeFromPath, pathFor } from './locale';

describe('localeFromPath', () => {
  it('lit le français à la racine', () => {
    expect(localeFromPath('/')).toBe('fr');
    expect(localeFromPath('/index.html')).toBe('fr');
  });

  it('lit l’anglais sous /en', () => {
    expect(localeFromPath('/en')).toBe('en');
    expect(localeFromPath('/en/')).toBe('en');
    expect(localeFromPath('/en/index.html')).toBe('en');
  });

  it('ne prend pas pour de l’anglais un chemin qui commence seulement par « en »', () => {
    expect(localeFromPath('/enigme')).toBe('fr');
    expect(localeFromPath('/fr/en')).toBe('fr');
  });
});

describe('pathFor', () => {
  it('donne l’accueil de chaque langue, et localeFromPath le relit', () => {
    expect(pathFor('fr')).toBe('/');
    expect(pathFor('en')).toBe('/en/');
    for (const locale of ['fr', 'en'] as const) {
      expect(localeFromPath(pathFor(locale))).toBe(locale);
    }
  });
});
