const NEW_ISSUE = 'https://github.com/phamelin42/flag-quizz/issues/new';

/**
 * Ticket GitHub pré-rempli (modèle `.github/ISSUE_TEMPLATE/astuce.yml`) pour proposer une astuce.
 * Les tickets sont le stockage des propositions : le nom et le code viennent de nos données, jamais d’une saisie.
 */
export function suggestTipUrl(code: string, countryName: string): string {
  const params = new URLSearchParams({
    template: 'astuce.yml',
    title: `Astuce : ${countryName} (${code})`,
    country: `${countryName} (${code})`,
  });
  return `${NEW_ISSUE}?${params.toString()}`;
}
