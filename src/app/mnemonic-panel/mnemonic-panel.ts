import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { FdBadge, FdCard, FdLink } from 'fuda';
import { Country } from '../data/country';
import { LocaleService } from '../i18n/locale.service';
import { suggestTipUrl } from './suggest-tip-url';

/**
 * L'astuce pour reconnaître le drapeau : une image à y voir, ou ce qui le distingue d'un drapeau jumeau.
 * Le parent ne l'affiche qu'une fois la question répondue.
 */
@Component({
  selector: 'app-mnemonic-panel',
  imports: [FdBadge, FdCard, FdLink],
  templateUrl: './mnemonic-panel.html',
  styleUrl: './mnemonic-panel.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-mnemonic-panel' },
})
export class MnemonicPanel {
  readonly country = input.required<Country>();

  protected readonly i18n = inject(LocaleService);

  protected readonly name = computed(() => this.i18n.countryName(this.country().code));
  protected readonly mnemonic = computed(() => this.i18n.mnemonic(this.country()));
  protected readonly suggestUrl = computed(() => suggestTipUrl(this.country().code, this.name()));
}
