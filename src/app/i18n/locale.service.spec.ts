import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { COUNTRY_LIST } from '../data/countries';
import { FUN_FACTS_EN } from '../data/fun-facts.en';
import { INITIAL_LOCALE, LocaleService } from './locale.service';
import { Locale } from './locale';

function setup(initial: Locale = 'fr') {
  TestBed.configureTestingModule({ providers: [{ provide: INITIAL_LOCALE, useValue: initial }] });
  return TestBed.inject(LocaleService);
}

const france = COUNTRY_LIST.find((c) => c.code === 'fr')!;

describe('LocaleService', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
    document.documentElement.lang = '';
  });

  it('démarre dans la langue de l’adresse', () => {
    expect(setup('en').locale()).toBe('en');
    TestBed.resetTestingModule();
    expect(setup('fr').locale()).toBe('fr');
  });

  it('suit la langue sur <html lang> et le titre de la page', async () => {
    const service = setup('fr');
    TestBed.tick();
    expect(document.documentElement.lang).toBe('fr');

    service.switchTo('en');
    TestBed.tick();
    expect(document.documentElement.lang).toBe('en');
    expect(TestBed.inject(Title).getTitle()).toBe('Flag Quizz');
    expect(document.querySelector('meta[name="description"]')!.getAttribute('content')).toBe(
      'Guess the country from its flag.',
    );
  });

  it('met l’adresse à jour au changement de langue, sans recharger', () => {
    const service = setup('fr');
    service.switchTo('en');
    expect(location.pathname).toBe('/en/');
    expect(service.otherLocale()).toBe('fr');
    expect(service.otherLocaleHref()).toBe('/');

    service.switchTo('fr');
    expect(location.pathname).toBe('/');
  });

  it('ne touche pas à l’historique quand la langue ne change pas', () => {
    const service = setup('fr');
    const length = history.length;
    service.switchTo('fr');
    expect(history.length).toBe(length);
  });

  it('suit le retour arrière du navigateur', () => {
    const service = setup('fr');
    service.switchTo('en');
    history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(service.locale()).toBe('fr');
  });

  it('donne le nom du pays et son anecdote dans la langue courante', () => {
    const service = setup('fr');
    expect(service.countryName('jp')).toBe('Japon');
    expect(service.funFact(france)).toBe(france.funFact);

    service.switchTo('en');
    expect(service.countryName('jp')).toBe('Japan');
    expect(service.funFact(france)).toBe(FUN_FACTS_EN['fr']);
    expect(service.funFact(france)).not.toBe(france.funFact);
  });
});
