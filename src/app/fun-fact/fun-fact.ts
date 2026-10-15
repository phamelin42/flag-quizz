import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { FdBadge, FdCard } from 'fuda';
import { Country } from '../data/country';
import { LocaleService } from '../i18n/locale.service';

/** Une anecdote ou un bout d'histoire sur le drapeau. Le parent ne l'affiche qu'une fois la question répondue. */
@Component({
  selector: 'app-fun-fact',
  imports: [FdBadge, FdCard],
  templateUrl: './fun-fact.html',
  styleUrl: './fun-fact.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-fun-fact' },
})
export class FunFact {
  readonly country = input.required<Country>();

  protected readonly i18n = inject(LocaleService);

  protected readonly name = computed(() => this.i18n.countryName(this.country().code));
  protected readonly fact = computed(() => this.i18n.funFact(this.country()));
}
