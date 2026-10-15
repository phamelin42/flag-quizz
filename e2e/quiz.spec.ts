import { expect, test } from '@playwright/test';
import { answer, currentCode, nameOf, openQuiz } from './helpers';

test('une bonne réponse valide le pays et révèle astuce, anecdote et carte', async ({ page }) => {
  await openQuiz(page);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.app-mnemonic-panel')).toHaveCount(0);
  await expect(page.locator('.app-fun-fact')).toHaveCount(0);
  await expect(page.locator('.app-map-panel')).toHaveCount(0);
  await expect(page.locator('.app-flag')).toHaveAttribute('alt', 'Drapeau à deviner');

  const code = await answer(page, true);

  await expect(page.locator('.app-status')).toContainText('Bonne réponse');
  await expect(page.locator('.app-option.fd-button--success')).toContainText(nameOf(code));
  await expect(page.locator('fd-alert')).toHaveCount(0);
  await expect(page.locator('.app-stats')).toContainText('Score 1 / 1');
  await expect(page.locator('.app-mnemonic-panel .fd-card__text')).not.toBeEmpty();
  await expect(page.locator('.app-fun-fact .fd-card__text')).not.toBeEmpty();
  await expect(page.locator('.app-fun-fact .fd-card__text')).not.toBeEmpty();
  const iframe = page.locator('iframe.app-map');
  await expect(iframe).toBeVisible();
  const src = new URL((await iframe.getAttribute('src'))!);
  expect(src.hostname).toBe('www.google.com');
  expect(src.searchParams.get('q')).toBe(nameOf(code));
  await expect(page.locator('.app-flag')).toHaveAttribute('alt', `Drapeau : ${nameOf(code)}`);
});

test('l’onglet a une icône', async ({ page }) => {
  await openQuiz(page);
  for (const selector of [
    'link[rel="icon"][type="image/svg+xml"]',
    'link[rel="icon"][sizes="48x48"]',
    'link[rel="apple-touch-icon"]',
  ]) {
    const href = await page.locator(selector).getAttribute('href');
    expect(href, selector).toBeTruthy();
    const response = await page.request.get(new URL(href!, page.url()).toString());
    expect(response.status(), href!).toBe(200);
    expect((await response.body()).length, href!).toBeGreaterThan(100);
  }
});

test('une mauvaise réponse montre la bonne et remet la série à zéro', async ({ page }) => {
  await openQuiz(page);
  const code = await answer(page, false);

  await expect(page.locator('.app-status')).toContainText('Mauvaise réponse');
  await expect(page.locator('.app-status')).toContainText(nameOf(code));
  await expect(page.locator('.fd-button--danger')).toHaveCount(1);
  await expect(page.locator('.app-option.fd-button--success')).toContainText(nameOf(code));
  await expect(page.locator('.app-stats')).toContainText('Score 0 / 1');
});

test('Drapeau suivant pose une nouvelle question sans réponse ni carte', async ({ page }) => {
  await openQuiz(page);
  const first = await answer(page, true);
  await page.getByRole('button', { name: 'Drapeau suivant' }).click();

  await expect(page.locator('.app-flag')).not.toHaveAttribute('src', `flags/4x3/${first}.svg`);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.app-mnemonic-panel')).toHaveCount(0);
  await expect(page.locator('.app-fun-fact')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Drapeau suivant' })).toHaveCount(0);
  await expect(page.locator('.app-option')).toHaveCount(4);
  await expect(page.locator('.app-stats')).toContainText('Série 1');
});

test('une question répond une seule fois', async ({ page }) => {
  await openQuiz(page);
  await answer(page, false);
  // Playwright n'attend pas un élément aria-disabled : le clic est forcé, comme celui d'un joueur pressé.
  await page.locator('.app-option[aria-disabled="true"]').first().click({ force: true });
  await expect(page.locator('.app-stats')).toContainText('Score 0 / 1');
});

test('le clavier suffit : répondre, puis passer au drapeau suivant', async ({ page }) => {
  await openQuiz(page);
  const first = await currentCode(page);

  // Arrêts de tabulation : le lien vers le quiz des capitales, le sélecteur de thème, puis les 4 propositions.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Quiz des capitales' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('switch', { name: 'Thème nuit' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.app-option').first()).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('button', { name: 'Drapeau suivant' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('.app-flag')).not.toHaveAttribute('src', `flags/4x3/${first}.svg`);
  await expect(page.locator('.app-option').first()).toBeFocused();
});

test('toute la partie tient avec le mouvement réduit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openQuiz(page);
  await answer(page, true);
  await expect(page.locator('.app-status')).toContainText('Bonne réponse');
  await page.getByRole('button', { name: 'Drapeau suivant' }).click();
  await expect(page.locator('.app-option')).toHaveCount(4);
});

test('la bascule de thème pose data-theme="dark" sur <html>', async ({ page }) => {
  await openQuiz(page);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await page.getByText('Thème nuit').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('le lien du quiz des capitales mène à capitals-quizz.phamelin.fr', async ({ page }) => {
  await openQuiz(page);
  const link = page.getByRole('navigation', { name: 'Autres quiz' }).getByRole('link', {
    name: 'Quiz des capitales',
  });
  await expect(link).toHaveAttribute('href', 'https://capitals-quizz.phamelin.fr');
});

test('le pied de page renvoie au portfolio, sur l’ancre projects', async ({ page }) => {
  await openQuiz(page);
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Vous voulez en voir plus ? Visitez mon portfolio');
  await expect(footer.getByRole('link', { name: 'portfolio' })).toHaveAttribute(
    'href',
    'https://phamelin.fr/#projects',
  );
  // Le pied de page est tout en bas de la page, sous le contenu.
  const main = (await page.locator('main').boundingBox())!;
  const box = (await footer.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(main.y + main.height - 1);
});

test('astuce et anecdote ont ensemble la hauteur de la carte', async ({ page }) => {
  await openQuiz(page);
  await answer(page, true);
  await expect(page.locator('iframe.app-map')).toBeVisible();
  const box = async (selector: string) => (await page.locator(selector).boundingBox())!;
  const [hints, map, mnemonic, funFact] = [
    await box('.app-hints'),
    await box('.app-map-panel'),
    await box('.app-mnemonic-panel'),
    await box('.app-fun-fact'),
  ];
  expect(Math.abs(hints.height - map.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(hints.y - map.y)).toBeLessThanOrEqual(1);
  // Empilés, les deux cadres de gauche vont du haut au bas de la carte, sans trou ni débordement.
  expect(Math.abs(mnemonic.y - map.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(funFact.y + funFact.height - (map.y + map.height))).toBeLessThanOrEqual(1);
  expect(mnemonic.y + mnemonic.height).toBeLessThanOrEqual(funFact.y);
});

test('Drapeau suivant est aligné en bas du cadre du drapeau', async ({ page }) => {
  await openQuiz(page);
  await answer(page, true);
  const flag = (await page.locator('.app-flag-card .fd-card').boundingBox())!;
  const next = (await page.getByRole('button', { name: 'Drapeau suivant' }).boundingBox())!;
  const options = (await page.locator('.app-options').boundingBox())!;
  // Le bas du bouton rejoint le bas du drapeau, et les réponses restent en haut.
  expect(Math.abs(next.y + next.height - (flag.y + flag.height))).toBeLessThanOrEqual(1);
  expect(options.y).toBeLessThanOrEqual(flag.y + 1);
  expect(next.y).toBeGreaterThan(options.y + options.height);
});

test('les 4 propositions tiennent sur un écran de téléphone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openQuiz(page);
  await answer(page, true);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
