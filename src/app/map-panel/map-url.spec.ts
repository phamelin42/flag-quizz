import { mapUrl } from './map-url';

describe('mapUrl', () => {
  it('construit l’URL d’intégration Google Maps en français', () => {
    const url = new URL(mapUrl('Japon'));
    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/maps');
    expect(url.searchParams.get('q')).toBe('Japon');
    expect(url.searchParams.get('output')).toBe('embed');
    expect(url.searchParams.get('hl')).toBe('fr');
  });

  it('demande la carte dans la langue du site', () => {
    expect(new URL(mapUrl('Japan', 'en')).searchParams.get('hl')).toBe('en');
  });

  it('encode les caractères spéciaux du nom', () => {
    const url = mapUrl('Côte d’Ivoire & co/?#');
    expect(new URL(url).searchParams.get('q')).toBe('Côte d’Ivoire & co/?#');
    expect(new URL(url).hash).toBe('');
  });
});
