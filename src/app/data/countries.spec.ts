import flagIcons from 'flag-icons/country.json';
import { COUNTRY_LIST } from './countries';
import { FUN_FACTS_EN } from './fun-facts.en';
import { MNEMONICS_EN } from './mnemonics.en';
import { countryName } from './country-name';

const available = new Set(flagIcons.filter((flag) => flag.iso).map((flag) => flag.code));

describe('COUNTRY_LIST', () => {
  it('compte les 193 États membres de l’ONU et les 2 États observateurs', () => {
    expect(COUNTRY_LIST).toHaveLength(195);
  });

  it('n’a aucun code en double', () => {
    const codes = COUNTRY_LIST.map((country) => country.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('écrit les codes en minuscules, sur deux lettres', () => {
    for (const { code } of COUNTRY_LIST) {
      expect(code).toMatch(/^[a-z]{2}$/);
    }
  });

  it('a un drapeau SVG pour chaque pays', () => {
    const missing = COUNTRY_LIST.filter(({ code }) => !available.has(code)).map((c) => c.code);
    expect(missing).toEqual([]);
  });

  it('a une anecdote rédigée pour chaque pays', () => {
    for (const { code, funFact } of COUNTRY_LIST) {
      expect(funFact.trim().length, `anecdote de ${code}`).toBeGreaterThan(20);
    }
  });

  it('a une anecdote anglaise pour chaque pays, et aucune en trop', () => {
    expect(Object.keys(FUN_FACTS_EN).sort()).toEqual(COUNTRY_LIST.map((c) => c.code).sort());
    for (const { code, funFact } of COUNTRY_LIST) {
      const english = FUN_FACTS_EN[code];
      expect(english.trim().length, `anecdote anglaise de ${code}`).toBeGreaterThan(20);
      expect(english, `anecdote anglaise de ${code}`).not.toBe(funFact);
    }
  });

  it('a une astuce rédigée pour chaque pays, sans doublon', () => {
    for (const { code, mnemonic } of COUNTRY_LIST) {
      expect(mnemonic.trim().length, `astuce de ${code}`).toBeGreaterThan(20);
    }
    const mnemonics = COUNTRY_LIST.map(({ mnemonic }) => mnemonic);
    expect(new Set(mnemonics).size).toBe(mnemonics.length);
  });

  it('a une astuce anglaise pour chaque pays, et aucune en trop', () => {
    expect(Object.keys(MNEMONICS_EN).sort()).toEqual(COUNTRY_LIST.map((c) => c.code).sort());
    for (const { code, mnemonic } of COUNTRY_LIST) {
      const english = MNEMONICS_EN[code];
      expect(english.trim().length, `astuce anglaise de ${code}`).toBeGreaterThan(20);
      expect(english, `astuce anglaise de ${code}`).not.toBe(mnemonic);
    }
    const english = Object.values(MNEMONICS_EN);
    expect(new Set(english).size).toBe(english.length);
  });

  it('écrit les apostrophes de façon typographique, dans toutes les langues', () => {
    for (const { code, mnemonic, funFact } of COUNTRY_LIST) {
      const texts = [mnemonic, funFact, MNEMONICS_EN[code], FUN_FACTS_EN[code]].join(' ');
      expect(texts, `apostrophe droite dans ${code}`).not.toContain("'");
    }
  });

  it('a un nom anglais distinct pour chaque pays', () => {
    const names = COUNTRY_LIST.map(({ code }) => countryName(code, 'en'));
    for (const [i, name] of names.entries()) {
      expect(name, COUNTRY_LIST[i].code).not.toBe(COUNTRY_LIST[i].code.toUpperCase());
    }
    expect(new Set(names).size).toBe(names.length);
  });

  it('a un nom français distinct pour chaque pays', () => {
    const names = COUNTRY_LIST.map(({ code }) => countryName(code));
    for (const [i, name] of names.entries()) {
      expect(name, COUNTRY_LIST[i].code).not.toBe(COUNTRY_LIST[i].code.toUpperCase());
    }
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('countryName', () => {
  it('donne le nom français du pays', () => {
    expect(countryName('fr')).toBe('France');
    expect(countryName('de')).toBe('Allemagne');
    expect(countryName('jp')).toBe('Japon');
  });

  it('raccourcit les noms trop lourds', () => {
    expect(countryName('va')).toBe('Vatican');
    expect(countryName('ps')).toBe('Palestine');
  });

  it('donne le nom anglais du pays quand on le demande', () => {
    expect(countryName('fr', 'en')).toBe('France');
    expect(countryName('de', 'en')).toBe('Germany');
    expect(countryName('jp', 'en')).toBe('Japan');
  });

  it('raccourcit en anglais les noms trop lourds', () => {
    expect(countryName('cd', 'en')).toBe('DR Congo');
    expect(countryName('cg', 'en')).toBe('Republic of the Congo');
    expect(countryName('mm', 'en')).toBe('Myanmar');
    expect(countryName('ps', 'en')).toBe('Palestine');
  });

  it('accepte les majuscules', () => {
    expect(countryName('BR')).toBe('Brésil');
  });
});
