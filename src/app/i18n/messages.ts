import { Locale } from './locale';

/** Tous les textes de l'interface. Les anecdotes et les noms de pays sont ailleurs (`data/`). */
export interface Messages {
  readonly scoreLabel: string;
  readonly score: (correct: number, asked: number) => string;
  readonly streak: (n: number) => string;
  readonly record: (n: number) => string;
  readonly darkTheme: string;
  /** Nom de la langue vers laquelle bascule le lien, écrit dans cette langue. */
  readonly otherLanguageName: string;
  readonly chooseCountry: string;
  readonly correctAnswerSr: string;
  readonly wrongAnswerSr: string;
  readonly verdict: (correct: boolean, countryName: string) => string;
  readonly nextFlag: string;
  readonly flagQuestion: string;
  readonly flagToGuess: string;
  readonly flagOf: (countryName: string) => string;
  readonly didYouKnow: string;
  readonly factTitle: string;
  readonly mapTitle: string;
  readonly mapFrameTitle: (countryName: string) => string;
  /** Langue de l'interface de Google Maps (paramètre `hl`). */
  readonly mapLanguage: string;
}

const fr: Messages = {
  scoreLabel: 'Ton score',
  score: (correct, asked) => `Score ${correct} / ${asked}`,
  streak: (n) => `Série ${n}`,
  record: (n) => `Record ${n}`,
  darkTheme: 'Thème nuit',
  otherLanguageName: 'English',
  chooseCountry: 'Choisis le pays de ce drapeau',
  correctAnswerSr: ', bonne réponse',
  wrongAnswerSr: ', ta réponse, incorrecte',
  verdict: (correct, name) =>
    correct ? `Bonne réponse : ${name}.` : `Mauvaise réponse. La bonne réponse était : ${name}.`,
  nextFlag: 'Drapeau suivant',
  flagQuestion: 'Quel est ce drapeau ?',
  flagToGuess: 'Drapeau à deviner',
  flagOf: (name) => `Drapeau : ${name}`,
  didYouKnow: 'Le saviez-vous ?',
  factTitle: 'Un bout d’histoire',
  mapTitle: 'Où se trouve ce pays ?',
  mapFrameTitle: (name) => `Carte Google Maps : ${name}`,
  mapLanguage: 'fr',
};

const en: Messages = {
  scoreLabel: 'Your score',
  score: (correct, asked) => `Score ${correct} / ${asked}`,
  streak: (n) => `Streak ${n}`,
  record: (n) => `Best ${n}`,
  darkTheme: 'Night theme',
  otherLanguageName: 'Français',
  chooseCountry: 'Pick the country of this flag',
  correctAnswerSr: ', correct answer',
  wrongAnswerSr: ', your answer, incorrect',
  verdict: (correct, name) =>
    correct ? `Correct: ${name}.` : `Wrong answer. The correct answer was: ${name}.`,
  nextFlag: 'Next flag',
  flagQuestion: 'Which flag is this?',
  flagToGuess: 'Flag to guess',
  flagOf: (name) => `Flag of ${name}`,
  didYouKnow: 'Did you know?',
  factTitle: 'A bit of history',
  mapTitle: 'Where is this country?',
  mapFrameTitle: (name) => `Google Maps: ${name}`,
  mapLanguage: 'en',
};

export const MESSAGES: Readonly<Record<Locale, Messages>> = { fr, en };
