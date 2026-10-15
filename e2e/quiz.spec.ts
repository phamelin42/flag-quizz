import { expect, test } from '@playwright/test';
import { answer, currentCode, nameOf, openQuiz } from './helpers';

test('une bonne réponse valide le pays et révèle anecdote et carte', async ({ page }) => {
  await openQuiz(page);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.app-fun-fact')).toHaveCount(0);
  await expect(page.locator('.app-map-panel')).toHaveCount(0);
  await expect(page.locator('.app-flag')).toHaveAttribute('alt', 'Drapeau à deviner');

  const code = await answer(page, true);

  await expect(page.locator('.app-status')).toContainText('Bonne réponse');
  await expect(page.locator('.app-option.fd-button--success')).toContainText(nameOf(code));
  await expect(page.locator('fd-alert')).toHaveCount(0);
  await expect(page.locator('.app-stats')).toContainText('Score 1 / 1');
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
  await expect(page.locator('.app-fun-fact')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Drapeau suivant' })).toHaveCount(0);
  await expect(page.locator('.app-option')).toHaveCount(4);
  await expect(page.locator('.app-stats')).toContainText('Série 1');
});

test('le drapeau suivant se charge dès la réponse, avant « Drapeau suivant »', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => {
    const match = /flags\/4x3\/([a-z]{2})\.svg$/.exec(request.url());
    if (match) requested.push(match[1]);
  });
  await openQuiz(page);
  const first = await currentCode(page);
  expect(requested).toEqual([first]);

  await answer(page, true);
  await expect.poll(() => requested.length).toBe(2);
  const upcoming = requested[1];
  expect(upcoming).not.toBe(first);

  await page.getByRole('button', { name: 'Drapeau suivant' }).click();
  await expect(page.locator('.app-flag')).toHaveAttribute('src', `flags/4x3/${upcoming}.svg`);
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

  // Les premiers arrêts de tabulation sont le sélecteur de thème et le lien de langue, puis les 4 propositions.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
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

test('les 4 propositions tiennent sur un écran de téléphone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openQuiz(page);
  await answer(page, true);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test.describe('version anglaise', () => {
  test('/en/ s’ouvre en anglais, avec le lien vers le français', async ({ page }) => {
    await openQuiz(page, 'light', 'en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Flag Quizz');
    await expect(page.getByText('Which flag is this?')).toBeVisible();
    await expect(page.locator('.app-flag')).toHaveAttribute('alt', 'Flag to guess');
    await expect(page.locator('.app-stats')).toContainText('Score 0 / 0');
    await expect(page.locator('.app-stats')).toContainText('Streak 0');
    await expect(page.getByText('Night theme')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/');
  });

  test('une partie complète en anglais', async ({ page }) => {
    await openQuiz(page, 'light', 'en');
    const code = await answer(page, true, 'en');

    await expect(page.locator('.app-status')).toContainText(`Correct: ${nameOf(code, 'en')}.`);
    await expect(page.locator('.app-option.fd-button--success')).toContainText(nameOf(code, 'en'));
    await expect(page.locator('.app-flag')).toHaveAttribute('alt', `Flag of ${nameOf(code, 'en')}`);
    await expect(page.getByText('Did you know?')).toBeVisible();
    await expect(page.locator('.app-fun-fact')).not.toContainText(/[éèàç]/);
    const src = new URL((await page.locator('iframe.app-map').getAttribute('src'))!);
    expect(src.searchParams.get('q')).toBe(nameOf(code, 'en'));
    expect(src.searchParams.get('hl')).toBe('en');

    await page.getByRole('button', { name: 'Next flag' }).click();
    await expect(page.locator('.app-flag')).not.toHaveAttribute('src', `flags/4x3/${code}.svg`);
    await expect(page.locator('.app-stats')).toContainText('Streak 1');
  });

  test('un mauvais choix est annoncé en anglais', async ({ page }) => {
    await openQuiz(page, 'light', 'en');
    const code = await answer(page, false, 'en');
    await expect(page.locator('.app-status')).toContainText(
      `Wrong answer. The correct answer was: ${nameOf(code, 'en')}.`,
    );
    await expect(page.locator('.app-option.fd-button--danger')).toContainText(
      'your answer, incorrect',
    );
  });

  test('changer de langue garde la partie et suit l’adresse', async ({ page }) => {
    await openQuiz(page);
    const code = await answer(page, true);
    await expect(page.locator('.app-stats')).toContainText('Score 1 / 1');

    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.app-stats')).toContainText('Score 1 / 1');
    await expect(page.locator('.app-option.fd-button--success')).toContainText(nameOf(code, 'en'));
    await expect(page.getByRole('button', { name: 'Next flag' })).toBeVisible();

    // Retour arrière : on revient au français.
    await page.evaluate(() => history.back());
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('button', { name: 'Drapeau suivant' })).toBeVisible();

    // Un rechargement reste dans la langue de l'adresse.
    await page.evaluate(() => history.forward());
    await expect(page).toHaveURL(/\/en\/$/);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Which flag is this?')).toBeVisible();
  });

  test('chaque langue a sa page d’accueil statique, avec son titre et sa langue', async ({
    request,
  }) => {
    const fr = await (await request.get('/')).text();
    const en = await (await request.get('/en/')).text();
    expect(fr).toContain('<html lang="fr"');
    expect(fr).toContain('Devine le pays à partir de son drapeau.');
    expect(en).toContain('<html lang="en"');
    expect(en).toContain('Guess the country from its flag.');
  });

  test('le français reste la langue par défaut sur les adresses inconnues', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});
