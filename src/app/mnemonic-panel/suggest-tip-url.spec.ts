import { describe, expect, it } from 'vitest';
import { suggestTipUrl } from './suggest-tip-url';

describe('suggestTipUrl', () => {
  it('ouvre le modèle de ticket « astuce » avec le pays pré-rempli', () => {
    const url = new URL(suggestTipUrl('jp', 'Japon'));
    expect(url.origin + url.pathname).toBe('https://github.com/phamelin42/flag-quizz/issues/new');
    expect(url.searchParams.get('template')).toBe('astuce.yml');
    expect(url.searchParams.get('title')).toBe('Astuce : Japon (jp)');
    expect(url.searchParams.get('country')).toBe('Japon (jp)');
  });
});
