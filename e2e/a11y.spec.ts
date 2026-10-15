import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { answer, openQuiz } from './helpers';

for (const locale of ['fr', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`axe, thème ${theme}, langue ${locale}`, () => {
      test('question en attente de réponse', async ({ page }) => {
        await openQuiz(page, theme, locale);
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze();
        expect(violations).toEqual([]);
      });

      for (const correct of [true, false]) {
        test(`après une ${correct ? 'bonne' : 'mauvaise'} réponse`, async ({ page }) => {
          await openQuiz(page, theme, locale);
          await answer(page, correct, locale);
          await expect(page.locator('iframe.app-map')).toBeVisible();
          const { violations } = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();
          expect(violations).toEqual([]);
        });
      }
    });
  }
}
