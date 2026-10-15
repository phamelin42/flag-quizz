import { Component, computed, effect, inject, ViewEncapsulation } from '@angular/core';
import { FdBadge, FdSwitch, FdThemeService } from 'fuda';
import { AnswerOptions } from './answer-options/answer-options';
import { FlagCard } from './flag-card/flag-card';
import { FunFact } from './fun-fact/fun-fact';
import { MapPanel } from './map-panel/map-panel';
import { FlagPreloader } from './quiz/flag-preloader';
import { QuizService } from './quiz/quiz.service';

@Component({
  selector: 'app-root',
  imports: [AnswerOptions, FdBadge, FdSwitch, FlagCard, FunFact, MapPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app' },
})
export class App {
  protected readonly quiz = inject(QuizService);
  private readonly themeService = inject(FdThemeService);
  private readonly preloader = inject(FlagPreloader);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  constructor() {
    // Dès qu'une réponse est choisie, le drapeau suivant se charge pendant que le joueur lit l'anecdote.
    effect(() => {
      if (this.quiz.isAnswered()) this.preloader.preload(this.quiz.upcoming().country);
    });
  }

  protected setDark(dark: boolean): void {
    this.themeService.set(dark ? 'dark' : 'light');
  }
}
