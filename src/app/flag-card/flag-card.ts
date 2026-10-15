import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { FdCard } from 'fuda';
import { Country } from '../data/country';
import { LocaleService } from '../i18n/locale.service';
import { flagUrl } from './flag-url';

/** Le drapeau à deviner. Tant qu'il n'est pas répondu, son texte alternatif ne donne pas le nom du pays. */
@Component({
  selector: 'app-flag-card',
  imports: [FdCard],
  templateUrl: './flag-card.html',
  styleUrl: './flag-card.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-flag-card' },
})
export class FlagCard {
  readonly country = input.required<Country>();
  readonly revealed = input(false);

  protected readonly i18n = inject(LocaleService);

  protected readonly src = computed(() => flagUrl(this.country()));
  protected readonly alt = computed(() => {
    const t = this.i18n.messages();
    return this.revealed() ? t.flagOf(this.i18n.countryName(this.country().code)) : t.flagToGuess;
  });
}
