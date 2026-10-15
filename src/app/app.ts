import { Component, computed, effect, inject, ViewEncapsulation } from '@angular/core';
import { FdBadge, FdLink, FdSwitch, FdThemeService } from 'fuda';
import { AnswerOptions } from './answer-options/answer-options';
import { FlagCard } from './flag-card/flag-card';
import { FunFact } from './fun-fact/fun-fact';
import { MapPanel } from './map-panel/map-panel';
import { MnemonicPanel } from './mnemonic-panel/mnemonic-panel';
import { LocaleService } from './i18n/locale.service';
import { FlagPreloader } from './quiz/flag-preloader';
import { QuizService } from './quiz/quiz.service';

@Component({
  selector: 'app-root',
  imports: [AnswerOptions, FdBadge, FdLink, FdSwitch, FlagCard, FunFact, MapPanel, MnemonicPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app' },
})
export class App {
  protected readonly quiz = inject(QuizService);
  private readonly themeService = inject(FdThemeService);
  private readonly preloader = inject(FlagPreloader);
  protected readonly i18n = inject(LocaleService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  constructor() {
    // Dès qu'une réponse est choisie, le drapeau suivant se charge pendant que le joueur lit l'anecdote.
    effect(() => {
      if (this.quiz.isAnswered()) this.preloader.preload(this.quiz.upcoming().country);
    });
  }

  /** Le lien pointe vraiment vers l'autre version ; un clic simple bascule sans recharger la partie. */
  protected switchLanguage(event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    this.i18n.switchTo(this.i18n.otherLocale());
  }

  protected setDark(dark: boolean): void {
    this.themeService.set(dark ? 'dark' : 'light');
  }
}
