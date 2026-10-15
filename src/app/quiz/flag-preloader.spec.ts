import { TestBed } from '@angular/core/testing';
import { FlagPreloader } from './flag-preloader';

describe('FlagPreloader', () => {
  it('demande le SVG du drapeau une seule fois', () => {
    const created: string[] = [];
    class FakeImage {
      set src(value: string) {
        created.push(value);
      }
    }
    vi.stubGlobal('Image', FakeImage);
    try {
      const preloader = TestBed.inject(FlagPreloader);
      preloader.preload({ code: 'jp', mnemonic: '', funFact: '' });
      preloader.preload({ code: 'jp', mnemonic: '', funFact: '' });
      preloader.preload({ code: 'fr', mnemonic: '', funFact: '' });
      expect(created).toEqual(['flags/4x3/jp.svg', 'flags/4x3/fr.svg']);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
