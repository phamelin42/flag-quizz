import { expect, Page } from '@playwright/test';

export type Locale = 'fr' | 'en';

const names = {
  fr: new Intl.DisplayNames(['fr'], { type: 'region' }),
  en: new Intl.DisplayNames(['en'], { type: 'region' }),
};
const OVERRIDES: Record<Locale, Record<string, string>> = {
  fr: { va: 'Vatican', ps: 'Palestine' },
  en: { cd: 'DR Congo', cg: 'Republic of the Congo', mm: 'Myanmar', ps: 'Palestine' },
};

export function nameOf(code: string, locale: Locale = 'fr'): string {
  return OVERRIDES[locale][code] ?? names[locale].of(code.toUpperCase())!;
}

/** OpenStreetMap n'est pas contacté pendant les tests : l'iframe reçoit une page vide. */
export async function openQuiz(
  page: Page,
  theme: 'light' | 'dark' = 'light',
  locale: Locale = 'fr',
): Promise<void> {
  await page.route('https://www.openstreetmap.org/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>carte</title>' }),
  );
  // Le thème Jour est celui par défaut : on ne force que le thème Nuit (et pas à chaque rechargement du test).
  if (theme === 'dark') {
    await page.addInitScript(() => {
      if (!localStorage.getItem('fuda-theme')) localStorage.setItem('fuda-theme', 'dark');
    });
  }
  await page.goto(locale === 'en' ? '/en/' : '/');
  await expect(page.locator('.app-option')).toHaveCount(4);
}

/** Code du pays affiché, lu dans l'URL du drapeau. */
export async function currentCode(page: Page): Promise<string> {
  const src = await page.locator('.app-flag').getAttribute('src');
  return /flags\/4x3\/([a-z]{2})\.svg/.exec(src ?? '')![1];
}

export async function answer(page: Page, correct: boolean, locale: Locale = 'fr'): Promise<string> {
  const code = await currentCode(page);
  const good = nameOf(code, locale);
  const options = page.locator('.app-option');
  const texts = await options.allInnerTexts();
  const index = texts.findIndex((text) => (text.trim() === good) === correct);
  await options.nth(index).click();
  return code;
}
