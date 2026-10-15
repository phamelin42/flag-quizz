/** Un pays du quiz. Son nom français est calculé à partir du code (voir `countryName`). */
export interface Country {
  /** Code ISO 3166-1 alpha-2 en minuscules, aussi le nom du fichier de drapeau (`flags/4x3/fr.svg`). */
  readonly code: string;
  /** Une astuce pour reconnaître le drapeau : une image à y voir, ou la différence avec un drapeau jumeau. */
  readonly mnemonic: string;
  /** Une anecdote ou un bout d'histoire sur le drapeau. */
  readonly funFact: string;
}
