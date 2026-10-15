import { Injectable } from '@angular/core';
import { Country } from '../data/country';
import { flagUrl } from '../flag-card/flag-url';

/**
 * Charge et décode le drapeau d'un pays avant qu'il ne soit affiché, pour que « Drapeau suivant »
 * le montre sans attente. Le drapeau d'après ne dit rien de la question en cours.
 */
@Injectable({ providedIn: 'root' })
export class FlagPreloader {
  /** Les images en cours de chargement restent référencées : sinon le navigateur peut les abandonner. */
  private readonly loading = new Map<string, HTMLImageElement>();

  preload(country: Country): void {
    const url = flagUrl(country);
    if (this.loading.has(url) || typeof Image === 'undefined') return;

    const image = new Image();
    image.src = url;
    this.loading.set(url, image);
    // Un échec n'est pas grave : l'`<img>` de la carte réessaiera au moment de l'affichage.
    image.decode?.().catch(() => undefined);
  }
}
