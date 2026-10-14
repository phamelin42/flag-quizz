import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { FdBadge, FdCard } from 'fuda';
import { Country } from '../data/country';
import { countryName } from '../data/country-name';

/** Cadre en bas à gauche : l'astuce pour reconnaître le drapeau, visible une fois la question répondue. */
@Component({
  selector: 'app-mnemonic-panel',
  imports: [FdBadge, FdCard],
  templateUrl: './mnemonic-panel.html',
  styleUrl: './mnemonic-panel.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-mnemonic-panel' },
})
export class MnemonicPanel {
  readonly country = input.required<Country>();
  readonly revealed = input(false);

  protected readonly waiting = 'Disponible après ta réponse';
  protected readonly name = computed(() => countryName(this.country().code));
}
