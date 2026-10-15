import { LOCALES } from './locale';
import { MESSAGES } from './messages';

describe('MESSAGES', () => {
  it('a les mêmes textes dans chaque langue, tous renseignés', () => {
    const keys = Object.keys(MESSAGES.fr).sort();
    for (const locale of LOCALES) {
      const messages = MESSAGES[locale];
      expect(Object.keys(messages).sort(), locale).toEqual(keys);
      for (const [key, value] of Object.entries(messages)) {
        const text = typeof value === 'function' ? value(1, 2) : value;
        expect(String(text).trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('nomme chaque langue dans sa propre langue pour le lien de bascule', () => {
    expect(MESSAGES.fr.otherLanguageName).toBe('English');
    expect(MESSAGES.en.otherLanguageName).toBe('Français');
  });

  it('annonce le verdict avec le nom du pays, dans chaque langue', () => {
    expect(MESSAGES.fr.verdict(true, 'Japon')).toBe('Bonne réponse : Japon.');
    expect(MESSAGES.fr.verdict(false, 'Japon')).toBe(
      'Mauvaise réponse. La bonne réponse était : Japon.',
    );
    expect(MESSAGES.en.verdict(true, 'Japan')).toBe('Correct: Japan.');
    expect(MESSAGES.en.verdict(false, 'Japan')).toBe(
      'Wrong answer. The correct answer was: Japan.',
    );
  });

  it('nomme le lien du portfolio et la navigation vers les autres quiz, dans chaque langue', () => {
    expect(MESSAGES.fr.portfolioPrompt).toBe('Vous voulez en voir plus ? Visitez mon');
    expect(MESSAGES.fr.portfolioLink).toBe('portfolio');
    expect(MESSAGES.fr.capitalsQuiz).toBe('Quiz des capitales');
    expect(MESSAGES.en.portfolioPrompt).toBe('Want to see more? Visit my');
    expect(MESSAGES.en.capitalsQuiz).toBe('Capitals quiz');
  });
});
