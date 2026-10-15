import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { countryName } from './data/country-name';
import { FUN_FACTS_EN } from './data/fun-facts.en';
import { MNEMONICS_EN } from './data/mnemonics.en';
import { FlagPreloader } from './quiz/flag-preloader';
import { COUNTRIES, QuizService, RANDOM } from './quiz/quiz.service';
import { COUNTRY_LIST } from './data/countries';
import { COUNTRY_BOUNDS } from './data/country-bounds';

function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

async function setup() {
  const preload = vi.fn();
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      { provide: FlagPreloader, useValue: { preload } },
      { provide: COUNTRIES, useValue: COUNTRY_LIST },
      { provide: RANDOM, useValue: seeded(11) },
    ],
  });
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const quiz = TestBed.inject(QuizService);
  const settle = () => fixture.whenStable();
  const options = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.app-option'));
  const optionFor = (code: string) =>
    options().find((b) => b.textContent!.includes(countryName(code)))!;
  return { fixture, el, quiz, settle, options, optionFor, preload };
}

describe('App', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
  });

  it('affiche un drapeau et 4 propositions', async () => {
    const { el, options, quiz } = await setup();
    const img = el.querySelector<HTMLImageElement>('.app-flag')!;
    expect(img.getAttribute('src')).toBe(`flags/4x3/${quiz.question().country.code}.svg`);
    expect(options()).toHaveLength(4);
  });

  it('garde le nom du pays secret avant la réponse', async () => {
    const { el, quiz } = await setup();
    const img = el.querySelector<HTMLImageElement>('.app-flag')!;
    expect(img.alt).toBe('Drapeau à deviner');
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.textContent).not.toContain(quiz.question().country.funFact);
    expect(el.textContent).not.toContain(quiz.question().country.mnemonic);
    expect(el.textContent).not.toContain('Drapeau suivant');
  });

  it('charge le drapeau suivant dès la réponse, pas avant', async () => {
    const { quiz, optionFor, settle, preload } = await setup();
    expect(preload).not.toHaveBeenCalled();

    optionFor(quiz.question().country.code).click();
    await settle();

    expect(preload).toHaveBeenCalledTimes(1);
    expect(preload).toHaveBeenCalledWith(quiz.upcoming().country);
  });

  it('n’affiche aucun encart avant la réponse', async () => {
    const { el } = await setup();
    expect(el.querySelector('.app-mnemonic-panel')).toBeNull();
    expect(el.querySelector('.app-fun-fact')).toBeNull();
    expect(el.querySelector('.app-map-panel')).toBeNull();
    expect(el.querySelector('fd-alert')).toBeNull();
  });

  it('valide une bonne réponse : verdict annoncé, astuce, anecdote, carte', async () => {
    const { el, quiz, optionFor, settle } = await setup();
    const { country } = quiz.question();
    optionFor(country.code).click();
    await settle();

    expect(el.querySelector('.app-status')!.textContent).toContain('Bonne réponse');
    expect(el.querySelector('fd-alert')).toBeNull();
    expect(el.querySelector('.app-mnemonic-panel')!.textContent).toContain(country.mnemonic);
    expect(el.querySelector('.app-fun-fact')!.textContent).toContain(country.funFact);
    const iframe = el.querySelector<HTMLIFrameElement>('iframe.app-map')!;
    expect(new URL(iframe.src).searchParams.get('bbox')).toBe(
      COUNTRY_BOUNDS[country.code].join(','),
    );
    expect(iframe.title).toContain(countryName(country.code));
    expect(el.querySelector('.app-flag')!.getAttribute('alt')).toBe(
      `Drapeau : ${countryName(country.code)}`,
    );
    expect(el.querySelector('.app-stats')!.textContent).toContain('Score 1 / 1');
  });

  it('signale une mauvaise réponse et indique la bonne', async () => {
    const { el, quiz, options, optionFor, settle } = await setup();
    const { country } = quiz.question();
    const wrong = options().find((b) => b !== optionFor(country.code))!;
    wrong.click();
    await settle();

    expect(el.querySelector('.app-status')!.textContent).toContain('Mauvaise réponse');
    expect(el.querySelector('.app-status')!.textContent).toContain(countryName(country.code));
    expect(optionFor(country.code).textContent).toContain('bonne réponse');
    expect(wrong.textContent).toContain('incorrecte');
    expect(wrong.className).toContain('fd-button--danger');
    expect(optionFor(country.code).className).toContain('fd-button--success');
    expect(el.querySelector('.app-stats')!.textContent).toContain('Score 0 / 1');
  });

  it('grise les autres propositions et ignore leurs clics', async () => {
    const { quiz, options, optionFor, settle } = await setup();
    const { country } = quiz.question();
    optionFor(country.code).click();
    await settle();

    expect(optionFor(country.code).className).toContain('fd-button--success');
    const others = options().filter((b) => b !== optionFor(country.code));
    expect(others.every((b) => b.getAttribute('aria-disabled') === 'true')).toBe(true);
    others[0].click();
    await settle();
    expect(quiz.score()).toBe(1);
    expect(quiz.asked()).toBe(1);
  });

  it('passe au drapeau suivant, avec un bouton secondaire, et recache les encarts', async () => {
    const { el, quiz, optionFor, settle } = await setup();
    const first = quiz.question().country.code;
    optionFor(first).click();
    await settle();
    const next = el.querySelector<HTMLButtonElement>('button.fd-button--lg')!;
    expect(next.className).not.toMatch(/fd-button--(primary|danger|success|ghost)/);
    next.click();
    await settle();

    expect(quiz.question().country.code).not.toBe(first);
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelector('.app-mnemonic-panel')).toBeNull();
    expect(el.querySelector('.app-fun-fact')).toBeNull();
    expect(el.querySelector('.app-status')!.textContent!.trim()).toBe('');
    expect(el.textContent).not.toContain('Drapeau suivant');
  });

  it('met le focus sur « Drapeau suivant » après une réponse, puis sur la première proposition', async () => {
    const { el, quiz, optionFor, options, settle } = await setup();
    document.body.appendChild(el);
    optionFor(quiz.question().country.code).click();
    await settle();
    const next = el.querySelector<HTMLButtonElement>('button.fd-button--lg')!;
    expect(document.activeElement).toBe(next);

    next.click();
    await settle();
    expect(document.activeElement).toBe(options()[0]);
    el.remove();
  });

  it('propose, dans le cadre astuce après la réponse, de proposer une meilleure astuce', async () => {
    const { el, quiz, optionFor, settle } = await setup();
    expect(el.querySelector('.app-suggest-tip')).toBeNull();
    optionFor(quiz.question().country.code).click();
    await settle();
    const link = el.querySelector<HTMLAnchorElement>('.app-mnemonic-panel a.app-suggest-tip')!;
    expect(link.textContent!.trim()).toBe('Proposer une meilleure astuce');
    const url = new URL(link.href);
    expect(url.pathname).toBe('/phamelin42/flag-quizz/issues/new');
    expect(url.searchParams.get('template')).toBe('astuce.yml');
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('propose en pied de page un lien vers le quiz des capitales', async () => {
    const { el } = await setup();
    const link = el.querySelector<HTMLAnchorElement>(
      'footer nav a[href="https://capitals-quizz.phamelin.fr"]',
    )!;
    expect(link.textContent!.trim()).toBe('Quiz des capitales');
    expect(link.closest('nav')!.getAttribute('aria-label')).toBe('Autres quiz');
  });

  it('propose en bas de page un lien vers le portfolio, ancre projects', async () => {
    const { el } = await setup();
    const line = el.querySelector('footer .app-footer-line')!;
    expect(line.textContent!.replace(/\s+/g, ' ').trim()).toBe(
      'Vous voulez en voir plus ? Visitez mon portfolio',
    );
    const link = line.querySelector<HTMLAnchorElement>('a')!;
    expect(link.textContent!.trim()).toBe('portfolio');
    expect(link.getAttribute('href')).toBe('https://phamelin.fr/#projects');
  });

  it('bascule le thème Nuit', async () => {
    const { el, settle } = await setup();
    const input = el.querySelector<HTMLInputElement>('fd-switch input')!;
    input.click();
    await settle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    input.click();
    await settle();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
  describe('version anglaise', () => {
    const link = (el: HTMLElement) => el.querySelector<HTMLAnchorElement>('a.app-language')!;

    it('propose le lien vers /en/, nommé en anglais, sans changer de langue au rendu', async () => {
      const { el } = await setup();
      expect(link(el).getAttribute('href')).toBe('/en/');
      expect(link(el).textContent).toContain('English');
      expect(link(el).getAttribute('lang')).toBe('en');
      expect(el.textContent).toContain('Quel est ce drapeau ?');
    });

    it('passe l’interface en anglais au clic, sans perdre la partie en cours', async () => {
      const { el, quiz, optionFor, settle } = await setup();
      const { country } = quiz.question();
      optionFor(country.code).click();
      await settle();

      link(el).click();
      await settle();

      expect(location.pathname).toBe('/en/');
      expect(document.documentElement.lang).toBe('en');
      expect(el.textContent).toContain('Which flag is this?');
      expect(el.textContent).toContain('Next flag');
      expect(el.querySelector('.app-stats')!.textContent).toContain('Score 1 / 1');
      expect(el.querySelector('.app-status')!.textContent).toContain(
        `Correct: ${countryName(country.code, 'en')}.`,
      );
      expect(el.querySelector('.app-mnemonic-panel')!.textContent).toContain(
        MNEMONICS_EN[country.code],
      );
      expect(el.querySelector('.app-mnemonic-panel')!.textContent).toContain('Tip');
      expect(el.querySelector('.app-fun-fact')!.textContent).toContain(FUN_FACTS_EN[country.code]);
      const iframe = el.querySelector<HTMLIFrameElement>('iframe.app-map')!;
      expect(iframe.title).toBe(`OpenStreetMap map: ${countryName(country.code, 'en')}`);
      expect(el.querySelector('.app-flag')!.getAttribute('alt')).toBe(
        `Flag of ${countryName(country.code, 'en')}`,
      );
      expect(link(el).getAttribute('href')).toBe('/');
      expect(link(el).textContent).toContain('Français');
    });

    it('traduit le lien des capitales et le pied de page, vers les mêmes adresses', async () => {
      const { el, settle } = await setup();
      link(el).click();
      await settle();

      const capitals = el.querySelector<HTMLAnchorElement>('footer nav a')!;
      expect(capitals.textContent!.trim()).toBe('Capitals quiz');
      expect(capitals.getAttribute('href')).toBe('https://capitals-quizz.phamelin.fr');
      expect(capitals.closest('nav')!.getAttribute('aria-label')).toBe('Other quizzes');
      const line = el.querySelector('footer .app-footer-line')!;
      expect(line.textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Want to see more? Visit my portfolio',
      );
      expect(line.querySelector('a')!.getAttribute('href')).toBe('https://phamelin.fr/#projects');
    });

    it('garde le nom du pays secret en anglais avant la réponse', async () => {
      const { el, quiz, settle } = await setup();
      link(el).click();
      await settle();

      expect(el.querySelector('.app-flag')!.getAttribute('alt')).toBe('Flag to guess');
      expect(el.textContent).not.toContain(FUN_FACTS_EN[quiz.question().country.code]);
      expect(el.textContent).not.toContain(MNEMONICS_EN[quiz.question().country.code]);
      expect(el.querySelector('iframe')).toBeNull();
    });

    it('laisse le navigateur ouvrir /en/ lui-même quand on clique avec Ctrl', async () => {
      const { el, settle } = await setup();
      let prevented: boolean | undefined;
      // Après le gestionnaire du lien : on note ce qu'il a fait, puis on évite la vraie navigation (jsdom).
      el.addEventListener('click', (event) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      });
      link(el).dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
      );
      await settle();
      expect(prevented).toBe(false);
      expect(location.pathname).toBe('/');
      expect(el.textContent).toContain('Quel est ce drapeau ?');
    });
  });
});
