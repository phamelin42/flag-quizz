import {
  computed,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  InjectionToken,
  signal,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Country } from '../data/country';
import { countryName } from '../data/country-name';
import { FUN_FACTS_EN } from '../data/fun-facts.en';
import { MNEMONICS_EN } from '../data/mnemonics.en';
import { Locale, localeFromPath, pathFor } from './locale';
import { MESSAGES } from './messages';
import seo from './seo.json';

/** Langue au démarrage : celle de l'adresse. Remplaçable dans les tests. */
export const INITIAL_LOCALE = new InjectionToken<Locale>('INITIAL_LOCALE', {
  providedIn: 'root',
  factory: () => localeFromPath(inject(DOCUMENT).defaultView?.location.pathname ?? '/'),
});

/**
 * Langue de l'interface. Changer de langue ne recharge pas la page : la partie en cours continue,
 * et l'adresse (`/` ou `/en/`) suit pour qu'on puisse la partager et revenir en arrière.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly locale = signal<Locale>(inject(INITIAL_LOCALE));
  readonly messages = computed(() => MESSAGES[this.locale()]);
  /** La langue vers laquelle bascule le lien de l'en-tête. */
  readonly otherLocale = computed<Locale>(() => (this.locale() === 'fr' ? 'en' : 'fr'));
  readonly otherLocaleHref = computed(() => pathFor(this.otherLocale()));

  constructor() {
    effect(() => {
      const locale = this.locale();
      this.document.documentElement.lang = locale;
      this.title.setTitle(seo[locale].title);
      this.meta.updateTag({ name: 'description', content: seo[locale].description });
    });

    // Retour arrière du navigateur : on suit l'adresse.
    this.document.defaultView?.addEventListener('popstate', () =>
      this.locale.set(localeFromPath(this.document.location.pathname)),
    );
  }

  /** Passe dans une autre langue et met l'adresse à jour. Sans effet si c'est déjà la langue courante. */
  switchTo(locale: Locale): void {
    if (locale === this.locale()) return;
    this.locale.set(locale);
    this.document.defaultView?.history.pushState(null, '', pathFor(locale));
  }

  countryName(code: string): string {
    return countryName(code, this.locale());
  }

  funFact(country: Country): string {
    return this.locale() === 'en'
      ? (FUN_FACTS_EN[country.code] ?? country.funFact)
      : country.funFact;
  }

  mnemonic(country: Country): string {
    return this.locale() === 'en'
      ? (MNEMONICS_EN[country.code] ?? country.mnemonic)
      : country.mnemonic;
  }
}
